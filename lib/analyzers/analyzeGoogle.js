const { THRESHOLDS, SEVERITY } = require("../constants");
const { sumField, safeDiv, issue, formatCurrency, pct } = require("../utils");

function analyzeGoogle(googleData) {
  if (!googleData?.campaigns?.length) {
    return { error: "No Google campaign data provided", issues: [], score: 0 };
  }

  const campaigns = googleData.campaigns;
  const issues    = [];
  const insights  = [];

  const searchCampaigns   = campaigns.filter((c) => c.type?.toLowerCase() === "search");
  const shoppingCampaigns = campaigns.filter((c) => c.type?.toLowerCase() === "shopping");

  // ── Wasted spend detection ────────────────────────────────────────────────
  const wastedCampaigns = campaigns.filter(
    (c) => c.roas < THRESHOLDS.google.minRoas || c.conversions === 0
  );
  const wastedSpend = sumField(wastedCampaigns, "spend");
  const totalSpend  = sumField(campaigns, "spend");

  if (wastedSpend > 0) {
    issues.push(issue(
      SEVERITY.HIGH, "GOOGLE_WASTED_SPEND",
      `${formatCurrency(wastedSpend)} identified as wasted spend across ${wastedCampaigns.length} campaign(s) with ROAS < 1 or zero conversions`,
      `You are spending ${formatCurrency(wastedSpend)} and getting nothing back. This is dead budget that could be reallocated to campaigns that convert.`,
      "Pause or restructure zero-conversion campaigns. Review match types, negative keywords, and landing page alignment."
    ));
  }

  // ── ROAS efficiency ────────────────────────────────────────────────────────
  const campaignsWithRoas = campaigns.filter((c) => c.roas != null);
  const avgRoas = campaignsWithRoas.length
    ? campaignsWithRoas.reduce((a, c) => a + c.roas, 0) / campaignsWithRoas.length
    : 0;

  if (avgRoas > 0 && avgRoas < 2) {
    issues.push(issue(
      SEVERITY.MEDIUM, "GOOGLE_LOW_ROAS",
      `Average ROAS across Google is ${avgRoas.toFixed(2)}x (target: ≥3x for healthy paid search)`,
      "Low ROAS means your ads are barely breaking even. Margins shrink and scaling becomes impossible.",
      "Review bidding strategy (switch to Target ROAS), improve Quality Score, and strengthen landing page relevance."
    ));
  }

  // ── Search: keyword health ─────────────────────────────────────────────────
  searchCampaigns.forEach((campaign) => {
    const keywords    = campaign.keywords || [];
    const broadCount  = keywords.filter((k) => !k.startsWith('"') && !k.startsWith('[')).length;
    const totalKw     = keywords.length;
    const broadPct    = pct(broadCount, totalKw);

    if (broadPct > 60 && totalKw > 0) {
      issues.push(issue(
        SEVERITY.MEDIUM, "GOOGLE_BROAD_KEYWORD_HEAVY",
        `Search campaign has ${broadPct}% broad match keywords — driving irrelevant traffic`,
        "Broad match without smart bidding wastes budget on searches with zero purchase intent.",
        "Shift to phrase and exact match. Add negative keywords for irrelevant queries. Review Search Terms report weekly."
      ));
    }

    if (totalKw === 0) {
      issues.push(issue(
        SEVERITY.HIGH, "GOOGLE_NO_KEYWORDS",
        "Search campaign found with no keywords defined",
        "A search campaign without keywords cannot serve. Budget is being wasted or campaign is inactive.",
        "Add tightly themed keyword groups. Use SKAGs (Single Keyword Ad Groups) for high-value terms."
      ));
    }
  });

  // ── Shopping: feed quality ────────────────────────────────────────────────
  shoppingCampaigns.forEach((campaign) => {
    const feedScore = campaign.feed_quality_score ?? 100;

    if (feedScore < THRESHOLDS.google.minFeedQualityScore) {
      issues.push(issue(
        SEVERITY.HIGH, "GOOGLE_POOR_FEED_QUALITY",
        `Shopping feed quality score is ${feedScore}/100 (minimum: ${THRESHOLDS.google.minFeedQualityScore})`,
        `Google uses feed data to match your products to searches. A score of ${feedScore} means poor titles, missing attributes, or disapproved products — costing you impressions and revenue.`,
        "Fix product titles (include brand, size, colour, material). Add GTINs, accurate prices, and high-res images. Resolve Merchant Center disapprovals."
      ));
    }

    // Product title quality
    const titles = campaign.product_titles || [];
    const weakTitles = titles.filter((t) => t && t.split(" ").length < 4);
    if (weakTitles.length > 0) {
      issues.push(issue(
        SEVERITY.MEDIUM, "GOOGLE_WEAK_PRODUCT_TITLES",
        `${weakTitles.length} product title(s) are too short and likely under-optimised`,
        "Thin product titles reduce your Shopping impression share. Competitors with richer titles win the auction.",
        "Expand titles to 70–150 characters. Include: brand + product type + key attributes (colour, size, material, model)."
      ));
    }
  });

  // ── Capture efficiency ────────────────────────────────────────────────────
  campaigns.forEach((campaign) => {
    const cpa = campaign.conversions > 0
      ? campaign.spend / campaign.conversions
      : null;

    if (campaign.spend > 5000 && campaign.conversions < 5) {
      issues.push(issue(
        SEVERITY.HIGH, "GOOGLE_LOW_CONVERSION_VOLUME",
        `Campaign spending ${formatCurrency(campaign.spend)} with only ${campaign.conversions} conversion(s)`,
        "High spend with near-zero conversions signals a structural problem: wrong audience, poor landing page, or broken tracking.",
        "Audit conversion tracking setup. Check landing page speed (<3s load time) and message-match between ad and page."
      ));
    }
  });

  // ── Positive signals ──────────────────────────────────────────────────────
  const strongCampaigns = campaigns.filter((c) => c.roas >= 3 && c.conversions > 10);
  if (strongCampaigns.length > 0) {
    insights.push(`${strongCampaigns.length} Google campaign(s) performing at ROAS ≥3x — prioritise scaling budget here.`);
  }

  const totalConversions = sumField(campaigns, "conversions");
  const blendedRoas      = avgRoas;
  const monthlyWasted    = wastedSpend;

  return {
    issues,
    insights,
    summary: {
      total_spend:        totalSpend,
      total_conversions:  totalConversions,
      avg_roas:           Math.round(blendedRoas * 100) / 100,
      wasted_spend:       wastedSpend,
      wasted_campaigns:   wastedCampaigns.length,
      search_campaigns:   searchCampaigns.length,
      shopping_campaigns: shoppingCampaigns.length,
    },
    wasted_campaigns: wastedCampaigns.map((c) => ({
      type:        c.type,
      spend:       c.spend,
      roas:        c.roas,
      conversions: c.conversions,
    })),
    top_campaigns:    rankGoogle(campaigns, "top"),
    worst_campaigns:  rankGoogle(campaigns, "bottom"),
  };
}

function rankGoogle(campaigns, dir) {
  const scored = campaigns
    .filter((c) => (c.spend || 0) > 0)
    .map((c) => ({
      name:        c.name || c.campaign_name || "Unnamed campaign",
      type:        c.type || "search",
      spend:       c.spend || 0,
      conversions: c.conversions || 0,
      roas:        c.roas ?? 0,
      cpa:         c.conversions > 0 ? Math.round(c.spend / c.conversions) : null,
      headline:    (c.headlines || [])[0] || c.name || "",
    }));
  scored.sort((a, b) => dir === "top" ? b.roas - a.roas : a.roas - b.roas);
  return scored.slice(0, 4);
}

module.exports = { analyzeGoogle };
