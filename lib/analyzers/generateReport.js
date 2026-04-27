const { SEVERITY } = require("../constants");
const { formatCurrency } = require("../utils");

const SEVERITY_ORDER = {
  [SEVERITY.CRITICAL]: 0,
  [SEVERITY.HIGH]:     1,
  [SEVERITY.MEDIUM]:   2,
  [SEVERITY.LOW]:      3,
};

function generateReport(metaResult, googleResult, competitorResult, crossInsights, scoreResult) {
  // ── Collect and sort all issues ───────────────────────────────────────────
  const allIssues = [
    ...(metaResult?.issues       || []),
    ...(googleResult?.issues     || []),
    ...(competitorResult?.issues || []),
  ].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4));

  // ── Top fixes (top 6, severity-sorted) ───────────────────────────────────
  const topFixes = allIssues.slice(0, 6).map((issue) => ({
    severity: issue.severity,
    title:    issue.message,
    impact:   issue.impact,
    action:   issue.fix,
  }));

  // ── Growth opportunities ──────────────────────────────────────────────────
  const growthOpportunities = buildGrowthOpportunities(
    metaResult, googleResult, competitorResult, scoreResult
  );

  // ── AI narrative summary ──────────────────────────────────────────────────
  const summary = buildSummary(metaResult, googleResult, competitorResult, scoreResult, crossInsights);

  // ── Key numbers ───────────────────────────────────────────────────────────
  const metaSpend    = metaResult?.performance?.total_spend    || 0;
  const googleSpend  = googleResult?.summary?.total_spend      || 0;
  const wastedSpend  = googleResult?.summary?.wasted_spend     || 0;
  const totalSpend   = metaSpend + googleSpend;

  return {
    funnel_health_score: scoreResult.total,
    score_breakdown:     scoreResult.breakdown,
    score_grade:         scoreResult.grade,
    score_label:         scoreResult.label,
    score_color:         scoreResult.color,

    meta_audit: {
      issues:          metaResult?.issues         || [],
      insights:        metaResult?.insights        || [],
      funnel_presence: metaResult?.funnel_presence || {},
      budget_split:    metaResult?.budget_split    || {},
      signal_quality:  metaResult?.signal_quality  || {},
      creative_system: metaResult?.creative_system || {},
      audience_mix:    metaResult?.audience_mix    || {},
      performance:     metaResult?.performance     || {},
    },

    google_audit: {
      issues:           googleResult?.issues           || [],
      insights:         googleResult?.insights         || [],
      summary:          googleResult?.summary          || {},
      wasted_campaigns: googleResult?.wasted_campaigns || [],
    },

    competitor_insights: {
      issues:       competitorResult?.issues      || [],
      insights:     competitorResult?.insights    || [],
      winning_ads:  competitorResult?.winning_ads || [],
      benchmarks:   competitorResult?.benchmarks  || {},
      competitors:  competitorResult?.competitors || [],
    },

    cross_platform_insights: crossInsights || [],

    top_fixes:           topFixes,
    growth_opportunities: growthOpportunities,

    kpis: {
      total_spend:            totalSpend,
      meta_spend:             metaSpend,
      google_spend:           googleSpend,
      wasted_spend:           wastedSpend,
      wasted_spend_formatted: formatCurrency(wastedSpend),
      total_issues:           allIssues.length,
      critical_issues:        allIssues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
      high_issues:            allIssues.filter((i) => i.severity === SEVERITY.HIGH).length,
    },

    summary,
    generated_at: new Date().toISOString(),
  };
}

function buildGrowthOpportunities(meta, google, competitor, score) {
  const opportunities = [];

  // Retargeting opportunity
  const metaSpend   = meta?.performance?.total_spend  || 0;
  const googleSpend = google?.summary?.total_spend    || 0;
  if (meta?.audience_mix?.retargeting === 0) {
    const estimate = Math.round((metaSpend + googleSpend) * 0.15);
    opportunities.push({
      title:    "Unlock Retargeting Revenue",
      detail:   `You are driving traffic but running zero retargeting. Based on your spend levels, retargeting campaigns could generate an additional ${formatCurrency(estimate)}/month from warm audiences who already know your brand.`,
      effort:   "Low",
      timeline: "2–3 weeks to launch",
      impact:   formatCurrency(estimate) + "/month",
    });
  }

  // Creative testing scale
  const userCreatives = competitor?.benchmarks?.user_creative_count || 0;
  const avgComp       = competitor?.benchmarks?.avg_competitor_creative_count || 0;
  if (avgComp > userCreatives * 1.5) {
    opportunities.push({
      title:    "Accelerate Creative Testing",
      detail:   "Competitors are running significantly more creative variations. Brands that test 5+ creatives simultaneously find winners 3× faster and reduce CPAs over time through continuous learning.",
      effort:   "Medium",
      timeline: "Ongoing — start within 1 week",
      impact:   "20–35% CPA reduction over 60 days",
    });
  }

  // Feed optimisation ROI
  const shoppingIssues = google?.issues?.filter((i) => i.code === "GOOGLE_POOR_FEED_QUALITY") || [];
  if (shoppingIssues.length > 0) {
    opportunities.push({
      title:    "Shopping Feed Optimisation",
      detail:   "Improving product feed quality (titles, attributes, GTINs) directly increases impression share and lowers CPCs. Brands that fully optimise feeds see 25–40% more Shopping clicks without increasing budget.",
      effort:   "Medium",
      timeline: "1–2 weeks",
      impact:   "25–40% more Shopping impressions",
    });
  }

  // Video content opportunity
  if (!meta?.creative_system?.has_video) {
    opportunities.push({
      title:    "Video Creative — Untapped Reach",
      detail:   "Meta's algorithm heavily favours video content. Launching even 1 video creative per funnel stage typically reduces CPMs by 20–30% and dramatically increases reach within the same budget.",
      effort:   "Medium",
      timeline: "2–4 weeks to produce",
      impact:   "20–30% CPM reduction",
    });
  }

  // CAPI signal recovery
  if (!meta?.signal_quality?.capi_enabled) {
    opportunities.push({
      title:    "Recover Lost Conversion Signal via CAPI",
      detail:   "Post-iOS 14, browser-only tracking misses ~30% of conversions. Enabling Conversions API recovers this signal, giving Meta's algorithm better data to optimise — typically improving ROAS by 15–25%.",
      effort:   "Low–Medium (requires dev work)",
      timeline: "1 week",
      impact:   "15–25% ROAS improvement",
    });
  }

  return opportunities.slice(0, 5);
}

function buildSummary(meta, google, competitor, score, crossInsights) {
  const metaSpend   = meta?.performance?.total_spend   || 0;
  const googleSpend = google?.summary?.total_spend     || 0;
  const wastedSpend = google?.summary?.wasted_spend    || 0;
  const totalSpend  = metaSpend + googleSpend;
  const avgRoas     = google?.summary?.avg_roas        || 0;

  const criticalCount = [
    ...(meta?.issues       || []),
    ...(google?.issues     || []),
    ...(competitor?.issues || []),
  ].filter((i) => i.severity === SEVERITY.CRITICAL || i.severity === SEVERITY.HIGH).length;

  const pixelOff  = !meta?.signal_quality?.pixel_active;
  const capiOff   = !meta?.signal_quality?.capi_enabled;
  const noTofu    = !meta?.funnel_presence?.tofu;
  const noRetar   = meta?.audience_mix?.retargeting === 0;

  let summaryLines = [];

  summaryLines.push(
    `Your paid media is currently scoring ${score.total}/100 — rated "${score.label}". ` +
    `Across ${formatCurrency(totalSpend)} in total ad spend, there are ${criticalCount} critical or high-priority issues requiring immediate attention.`
  );

  if (wastedSpend > 0) {
    summaryLines.push(
      `${formatCurrency(wastedSpend)}/month is being wasted on Google campaigns with zero return — this is dead budget that should be stopped or restructured today.`
    );
  }

  if (pixelOff) {
    summaryLines.push(
      "The Meta Pixel is inactive — every dollar spent on Meta is being delivered without optimisation data. CPAs will be significantly higher than they should be until this is resolved."
    );
  }

  if (capiOff && !pixelOff) {
    summaryLines.push(
      "The Conversions API is not enabled. Post-iOS 14 changes mean you are missing roughly 30% of conversion signals — your ROAS on Meta is likely understated."
    );
  }

  if (noTofu) {
    summaryLines.push(
      "There are no awareness campaigns running on Meta. You are relying entirely on capturing existing demand via Google, with no engine building new demand — this will cap your growth ceiling."
    );
  }

  if (noRetar) {
    summaryLines.push(
      "Zero retargeting campaigns are live. Every visitor who clicked your ads but didn't convert is being abandoned, despite you already paying to bring them in."
    );
  }

  if (crossInsights?.length > 0) {
    summaryLines.push(
      `Across platforms, the most urgent structural problem is: ${crossInsights[0]?.title || "a cross-platform alignment gap"}.`
    );
  }

  summaryLines.push(
    "The highest-ROI actions right now are: fix signal tracking (Pixel/CAPI), eliminate wasted Google spend, and launch retargeting campaigns. These three changes alone can materially improve profitability within 30 days."
  );

  return summaryLines.join(" ");
}

module.exports = { generateReport };
