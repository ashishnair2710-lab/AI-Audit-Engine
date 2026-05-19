const { THRESHOLDS, SEVERITY } = require("../constants");
const { sumField, safeDiv, issue, formatCurrency, pct } = require("../utils");

function analyzeGoogle(googleData, mode = "ecom") {
  if (!googleData?.campaigns?.length) {
    return { error: "No Google campaign data provided", issues: [], score: 0 };
  }

  const campaigns  = googleData.campaigns;
  const issues     = [];
  const insights   = [];
  const isLeadGen  = mode === "leadgen";

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
      isLeadGen
        ? `${formatCurrency(wastedSpend)} spent across ${wastedCampaigns.length} campaign(s) with zero leads`
        : `${formatCurrency(wastedSpend)} identified as wasted spend across ${wastedCampaigns.length} campaign(s) with ROAS < 1 or zero conversions`,
      isLeadGen
        ? `You are spending ${formatCurrency(wastedSpend)} and generating no leads from it. This budget needs to be stopped or restructured.`
        : `You are spending ${formatCurrency(wastedSpend)} and getting nothing back. This is dead budget that could be reallocated to campaigns that convert.`,
      isLeadGen
        ? "Pause zero-lead campaigns. Check that lead tracking is firing correctly before assuming the campaign is the problem."
        : "Pause or restructure zero-conversion campaigns. Review match types, negative keywords, and landing page alignment."
    ));
  }

  // ── ROAS / CPL efficiency ──────────────────────────────────────────────────
  const campaignsWithRoas = campaigns.filter((c) => c.roas != null);
  const avgRoas = campaignsWithRoas.length
    ? campaignsWithRoas.reduce((a, c) => a + c.roas, 0) / campaignsWithRoas.length
    : 0;
  const totalConversions = sumField(campaigns, "conversions");
  const avgCpl = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : null;

  if (isLeadGen) {
    if (avgCpl && avgCpl > 400) {
      issues.push(issue(
        SEVERITY.MEDIUM, "GOOGLE_HIGH_CPL",
        `Average cost per lead on Google is AED ${avgCpl}`,
        "High CPL on Search usually means broad keywords, weak landing page, or wrong bidding strategy for the conversion volume.",
        "Switch to Target CPA bidding once you have 30+ conversions/month. Tighten keyword match types. Test landing page headline and CTA."
      ));
    }
  } else if (avgRoas > 0 && avgRoas < 2) {
    issues.push(issue(
      SEVERITY.MEDIUM, "GOOGLE_LOW_ROAS",
      `Average ROAS across Google is ${avgRoas.toFixed(2)}x (target: 3x+ for healthy paid search)`,
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
        `Search campaign has ${broadPct}% broad match keywords.driving irrelevant traffic`,
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

  // ── Shopping: feed quality (ecom only) ───────────────────────────────────
  if (!isLeadGen) {
    shoppingCampaigns.forEach((campaign) => {
      const feedScore = campaign.feed_quality_score ?? 100;

      if (feedScore < THRESHOLDS.google.minFeedQualityScore) {
        issues.push(issue(
          SEVERITY.HIGH, "GOOGLE_POOR_FEED_QUALITY",
          `Shopping feed quality score is ${feedScore}/100 (minimum: ${THRESHOLDS.google.minFeedQualityScore})`,
          `Google uses feed data to match your products to searches. A score of ${feedScore} means poor titles, missing attributes, or disapproved products.costing you impressions and revenue.`,
          "Fix product titles (include brand, size, colour, material). Add GTINs, accurate prices, and high-res images. Resolve Merchant Center disapprovals."
        ));
      }

      const titles = campaign.product_titles || [];
      const weakTitles = titles.filter((t) => t && t.split(" ").length < 4);
      if (weakTitles.length > 0) {
        issues.push(issue(
          SEVERITY.MEDIUM, "GOOGLE_WEAK_PRODUCT_TITLES",
          `${weakTitles.length} product title(s) are too short and likely under-optimised`,
          "Thin product titles reduce your Shopping impression share. Competitors with richer titles win the auction.",
          "Expand titles to 70-150 characters. Include: brand + product type + key attributes (colour, size, material, model)."
        ));
      }
    });
  }

  // ── Lead Gen: landing page quality signal ─────────────────────────────────
  if (isLeadGen) {
    searchCampaigns.forEach((campaign) => {
      if (campaign.spend > 3000 && campaign.conversions < 3) {
        issues.push(issue(
          SEVERITY.HIGH, "GOOGLE_LOW_LEAD_VOLUME",
          `Search campaign spending ${formatCurrency(campaign.spend)} with only ${campaign.conversions} lead(s)`,
          "High spend with almost no leads points to a landing page problem, wrong keyword intent, or broken lead tracking — not just a budget issue.",
          "Check lead form is submitting correctly and firing the conversion tag. Test landing page with a heatmap tool. Check keyword intent — informational keywords rarely convert to leads."
        ));
      }
    });
  }

  // ── Capture efficiency (ecom) ─────────────────────────────────────────────
  if (!isLeadGen) {
    campaigns.forEach((campaign) => {
      if (campaign.spend > 5000 && campaign.conversions < 5) {
        issues.push(issue(
          SEVERITY.HIGH, "GOOGLE_LOW_CONVERSION_VOLUME",
          `Campaign spending ${formatCurrency(campaign.spend)} with only ${campaign.conversions} conversion(s)`,
          "High spend with near-zero conversions signals a structural problem: wrong audience, poor landing page, or broken tracking.",
          "Audit conversion tracking setup. Check landing page speed (<3s load time) and message-match between ad and page."
        ));
      }
    });
  }

  // ── Positive signals ──────────────────────────────────────────────────────
  const strongCampaigns = campaigns.filter((c) => c.roas >= 3 && c.conversions > 10);
  if (strongCampaigns.length > 0) {
    insights.push(`${strongCampaigns.length} Google campaign(s) performing at ROAS ≥3x.prioritise scaling budget here.`);
  }

  const totalConversions  = sumField(campaigns, "conversions");
  const totalConvValue    = sumField(campaigns, "conversion_value");
  const totalImpressions  = sumField(campaigns, "impressions");
  const totalClicks       = sumField(campaigns, "clicks");
  const blendedCtr        = totalImpressions > 0
    ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;
  const overallCpa        = totalConversions > 0
    ? Math.round(totalSpend / totalConversions) : null;

  // ── Irrelevant search terms: actual spend on zero-conversion terms ───────────
  // A term is "irrelevant" if it spent money but drove zero conversions AND
  // has a very low CTR (< 0.5%) — meaning searchers aren't engaging with the ad.
  // This uses real search_term_view data when available, falls back to broad match estimate.
  const searchTerms = googleData.search_terms || [];
  let irrelevantSpend = 0;
  let irrelevantTerms = [];

  if (searchTerms.length > 0) {
    // Min spend threshold to avoid noise from tiny impression tests
    const MIN_TERM_SPEND = 20;
    irrelevantTerms = searchTerms.filter(
      (t) => t.spend >= MIN_TERM_SPEND && t.conversions === 0 && t.ctr < 0.5
    );
    irrelevantSpend = Math.round(irrelevantTerms.reduce((sum, t) => sum + t.spend, 0));
  } else {
    // Fallback: estimate from campaigns with >60% broad match keywords
    searchCampaigns.forEach((campaign) => {
      const keywords   = campaign.keywords || [];
      const broadCount = keywords.filter((k) => !k.startsWith('"') && !k.startsWith("[")).length;
      const broadPct   = keywords.length > 0 ? broadCount / keywords.length : 0;
      if (broadPct > 0.6) irrelevantSpend += campaign.spend * broadPct;
    });
    irrelevantSpend = Math.round(irrelevantSpend);
  }

  // Issue: flag the worst irrelevant terms
  if (irrelevantTerms.length > 0 && irrelevantSpend > 0) {
    const top3 = irrelevantTerms.slice(0, 3).map((t) => `"${t.term}"`).join(", ");
    issues.push(issue(
      SEVERITY.MEDIUM,
      "GOOGLE_IRRELEVANT_TERMS",
      `${irrelevantTerms.length} search term${irrelevantTerms.length > 1 ? "s" : ""} spending with zero conversions and low CTR`,
      `These terms are eating ${formatCurrency(irrelevantSpend)} with nothing to show: ${top3}.`,
      `Open Search Terms Report, add these as negative keywords, and review your broad match usage.`
    ));
  }

  return {
    issues,
    insights,
    summary: {
      total_spend:        totalSpend,
      total_impressions:  totalImpressions,
      total_clicks:       totalClicks,
      total_conversions:  totalConversions,
      total_conv_value:   totalConvValue,
      avg_roas:           Math.round(avgRoas * 100) / 100,
      wasted_spend:       wastedSpend,
      wasted_campaigns:   wastedCampaigns.length,
      irrelevant_spend:   irrelevantSpend,
      irrelevant_terms:   irrelevantTerms.slice(0, 20).map((t) => ({
        term:         t.term,
        spend:        t.spend,
        clicks:       t.clicks,
        impressions:  t.impressions,
        ctr:          t.ctr,
        campaign_name:t.campaign_name,
      })),
      irrelevant_source:  searchTerms.length > 0 ? "search_terms_report" : "broad_match_estimate",
      blended_ctr:        blendedCtr,
      cpa:                overallCpa,
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
  const enriched = campaigns
    .filter((c) => (c.spend || 0) > 0 && (c.impressions || 0) > 0)
    .map((c) => {
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return {
        name:        c.name || c.campaign_name || "Unnamed",
        label:       (c.headlines || [])[0] || c.name || "Untitled ad",
        type:        c.type || "search",
        spend:       c.spend || 0,
        conversions: c.conversions || 0,
        roas:        c.roas ?? 0,
        ctr:         Math.round(ctr * 100) / 100,
        cpa:         c.conversions > 0 ? Math.round(c.spend / c.conversions) : null,
        headline:    (c.headlines || [])[0] || c.name || "",
      };
    });

  if (dir === "top") return [...enriched].sort((a, b) => b.ctr - a.ctr).slice(0, 3);
  const medianSpend = enriched.map((c) => c.spend).sort((a, b) => a - b)[Math.floor(enriched.length / 2)] || 0;
  return enriched
    .filter((c) => c.spend >= medianSpend)
    .sort((a, b) => a.ctr - b.ctr)
    .slice(0, 3);
}

module.exports = { analyzeGoogle };
