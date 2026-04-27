const { THRESHOLDS, SEVERITY } = require("../constants");
const { issue } = require("../utils");

function analyzeCompetitors(competitorData, metaData) {
  if (!competitorData?.length) {
    return { error: "No competitor data provided", issues: [], insights: [] };
  }

  const issues   = [];
  const insights = [];
  const winningAds = [];

  const userTotalCreatives = metaData?.campaigns
    ? metaData.campaigns.reduce((sum, c) => sum + (c.creatives_count || 0), 0)
    : 0;

  const userFormats = metaData?.campaigns
    ? [...new Set(metaData.campaigns.flatMap((c) => c.creative_types || []))]
    : [];

  const userHooks = metaData?.campaigns
    ? metaData.campaigns.flatMap((c) => c.hooks || [])
    : [];

  competitorData.forEach((competitor) => {
    const { brand, ad_count, formats, hooks, duration_days } = competitor;

    // ── Creative volume gap ──────────────────────────────────────────────
    if (ad_count > userTotalCreatives * THRESHOLDS.competitor.creativeVolumeMultiplier) {
      issues.push(issue(
        SEVERITY.HIGH, "COMPETITOR_CREATIVE_GAP",
        `${brand} is running ${ad_count} ads vs your ${userTotalCreatives} — ${Math.round(ad_count / Math.max(userTotalCreatives, 1))}× more creative volume`,
        `More creatives = more learning = faster optimisation. ${brand} is finding winners while you're repeating the same message.`,
        `Increase creative output to at least ${Math.ceil(ad_count / 2)} variations. Test different angles: price, social proof, benefit, fear, urgency.`
      ));
    }

    // ── Format gap ────────────────────────────────────────────────────────
    const competitorHasVideo = (formats || []).includes("video");
    const userHasVideo       = userFormats.includes("video");

    if (competitorHasVideo && !userHasVideo) {
      issues.push(issue(
        SEVERITY.HIGH, "COMPETITOR_VIDEO_FORMAT_GAP",
        `${brand} is running video ads — you are not`,
        "Video is the dominant format on Meta and drives higher reach and engagement. You are ceding this entire format to a competitor.",
        "Produce short-form video (15–30s) using UGC, product demos, or animated graphics. Even low-budget video outperforms static."
      ));
    }

    // ── Winning ads detection ─────────────────────────────────────────────
    if (duration_days >= THRESHOLDS.competitor.winningAdDays) {
      const winningEntry = {
        brand,
        ad_count,
        formats: formats || [],
        hooks:   hooks || [],
        duration_days,
        signal:  `Running for ${duration_days} days — high probability this creative is profitable`,
      };
      winningAds.push(winningEntry);

      insights.push(
        `${brand} has ads running for ${duration_days}+ days — these are likely winners. Study their hooks and format for inspiration.`
      );
    }

    // ── Messaging / hook gap ──────────────────────────────────────────────
    const competitorHooks = hooks || [];
    const uniqueCompetitorConcepts = extractConcepts(competitorHooks);
    const userConcepts             = extractConcepts(userHooks);
    const uncoveredConcepts        = uniqueCompetitorConcepts.filter(
      (concept) => !userConcepts.some((uc) => uc.includes(concept) || concept.includes(uc))
    );

    if (uncoveredConcepts.length > 0) {
      insights.push(
        `${brand} is messaging on: "${uncoveredConcepts.join('", "')}" — angles not covered in your current ads.`
      );
    }
  });

  // ── Cross-competitor patterns ─────────────────────────────────────────────
  const allCompetitorFormats = [...new Set(competitorData.flatMap((c) => c.formats || []))];
  const formatGaps           = allCompetitorFormats.filter((f) => !userFormats.includes(f));

  if (formatGaps.length > 0) {
    insights.push(`Format gap identified: competitors are using [${formatGaps.join(", ")}] that you are not testing.`);
  }

  const totalCompetitorAds = competitorData.reduce((sum, c) => sum + (c.ad_count || 0), 0);
  const avgCompetitorAds   = Math.round(totalCompetitorAds / competitorData.length);

  return {
    issues,
    insights,
    winning_ads: winningAds,
    benchmarks: {
      user_creative_count:        userTotalCreatives,
      avg_competitor_creative_count: avgCompetitorAds,
      total_competitor_ads:       totalCompetitorAds,
      competitors_analyzed:       competitorData.length,
      user_formats:               userFormats,
      competitor_formats:         allCompetitorFormats,
    },
    competitors: competitorData.map((c) => ({
      brand:        c.brand,
      ad_count:     c.ad_count,
      formats:      c.formats,
      duration_days: c.duration_days,
      is_winning:   c.duration_days >= THRESHOLDS.competitor.winningAdDays,
    })),
  };
}

function extractConcepts(hooks) {
  const keywords = ["free", "sale", "discount", "quality", "fast", "delivery", "trust", "best", "new", "exclusive", "limited", "guarantee", "results", "proven", "easy"];
  return hooks
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => keywords.includes(w));
}

module.exports = { analyzeCompetitors };
