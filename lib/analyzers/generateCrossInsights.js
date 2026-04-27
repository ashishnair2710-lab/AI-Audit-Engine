const { SEVERITY } = require("../constants");
const { formatCurrency, safeDiv } = require("../utils");

function generateCrossInsights(metaResult, googleResult) {
  const insights = [];

  const metaPerf    = metaResult?.performance    || {};
  const googleSumm  = googleResult?.summary      || {};
  const metaFunnel  = metaResult?.funnel_presence || {};
  const metaAudience= metaResult?.audience_mix   || {};

  const googleTotalSpend       = googleSumm.total_spend       || 0;
  const googleTotalConversions = googleSumm.total_conversions  || 0;
  const googleAvgRoas          = googleSumm.avg_roas           || 0;
  const googleWastedSpend      = googleSumm.wasted_spend       || 0;

  const metaTotalSpend         = metaPerf.total_spend          || 0;
  const metaConversions        = metaPerf.total_conversions    || 0;
  const metaCtr                = metaPerf.blended_ctr          || 0;

  // ── Case 1: Demand generation gap ────────────────────────────────────────
  // Google CPA is high + Meta TOFU is absent/underfunded
  const googleCpa        = safeDiv(googleTotalSpend, googleTotalConversions);
  const tofuIsWeak       = !metaFunnel.tofu || (metaResult?.budget_split?.tofu_pct || 0) < 30;
  const googleCpaIsHigh  = googleCpa > 300; // AED

  if (googleCpaIsHigh && tofuIsWeak) {
    const estimatedLoss = Math.round(googleTotalSpend * 0.25);
    insights.push({
      severity: SEVERITY.HIGH,
      code:     "CROSS_DEMAND_GAP",
      title:    "Demand Generation Gap: You're Paying to Capture Intent You Never Built",
      detail:   `Google CPA is ${formatCurrency(googleCpa)} and Meta TOFU spend is weak. You are relying on Google to capture demand, but without Meta building brand awareness, the audience pool is thin — forcing Google to pay more for fewer conversions.`,
      impact:   `Estimated overspend on Google due to thin demand: ~${formatCurrency(estimatedLoss)}/month`,
      fix:      "Invest in Meta awareness (TOFU) campaigns to build brand familiarity. This reduces Google CPAs by expanding the high-intent audience pool.",
    });
  }

  // ── Case 2: Engagement-to-conversion breakdown ────────────────────────────
  // Meta CTR is healthy but conversions are low
  const metaEngagementStrong  = metaCtr >= 2.0;
  const metaConversionWeak    = metaConversions < 20 && metaTotalSpend > 3000;

  if (metaEngagementStrong && metaConversionWeak) {
    insights.push({
      severity: SEVERITY.HIGH,
      code:     "CROSS_CONVERSION_STRUCTURE",
      title:    "Engagement is Strong — But Conversions Are Leaking",
      detail:   `Meta CTR is ${metaCtr}% (healthy) but only ${metaConversions} conversions were recorded despite significant spend. People are clicking but not buying — the problem is post-click: landing page, offer, or checkout friction.`,
      impact:   `Estimated revenue leaking from poor post-click experience: ~${formatCurrency(metaTotalSpend * 0.4)}/month`,
      fix:      "Audit landing page speed, message-match between ad and page, and checkout flow. Run CRO tests on the hero section and CTA.",
    });
  }

  // ── Case 3: Retargeting gap ───────────────────────────────────────────────
  const noMetaRetargeting    = metaAudience.retargeting === 0;
  const hasSpendOnBothPlatforms = metaTotalSpend > 0 && googleTotalSpend > 0;

  if (noMetaRetargeting && hasSpendOnBothPlatforms) {
    const estimatedRetargetingValue = Math.round((metaTotalSpend + googleTotalSpend) * 0.15);
    insights.push({
      severity: SEVERITY.HIGH,
      code:     "CROSS_NO_RETARGETING",
      title:    "Lost Revenue: Warm Audiences Are Being Abandoned",
      detail:   "You are driving traffic from both Meta and Google but running zero retargeting campaigns. Every visitor who didn't convert on the first visit is lost — despite already paying to acquire them.",
      impact:   `Estimated monthly revenue opportunity from retargeting: ~${formatCurrency(estimatedRetargetingValue)}`,
      fix:      "Set up Meta retargeting audiences: website visitors (90d), add-to-cart (30d), video viewers (75%+). Pair with Google RLSA for cross-platform retargeting.",
    });
  }

  // ── Case 4: Platform imbalance ────────────────────────────────────────────
  const totalSpend       = metaTotalSpend + googleTotalSpend;
  const googleSpendShare = Math.round(safeDiv(googleTotalSpend, totalSpend) * 100);
  const metaSpendShare   = Math.round(safeDiv(metaTotalSpend, totalSpend) * 100);

  if (googleSpendShare > 80 && metaTotalSpend > 0) {
    insights.push({
      severity: SEVERITY.MEDIUM,
      code:     "CROSS_PLATFORM_IMBALANCE",
      title:    "Over-Reliance on Google — No Demand Engine Running",
      detail:   `${googleSpendShare}% of paid media budget is on Google, ${metaSpendShare}% on Meta. Google captures existing demand — but without Meta building new demand, growth will plateau as your addressable market shrinks.`,
      impact:   "Capped growth ceiling — you can only reach people already searching for you.",
      fix:      "Gradually shift 20–30% of Google budget to Meta TOFU. Monitor Google conversion volume — if it holds, continue shifting.",
    });
  }

  // ── Case 5: Wasted spend cross-analysis ──────────────────────────────────
  if (googleWastedSpend > 2000 && metaTotalSpend > 0) {
    insights.push({
      severity: SEVERITY.MEDIUM,
      code:     "CROSS_REALLOCATION_OPPORTUNITY",
      title:    "Wasted Google Budget Could Fund Meta Growth",
      detail:   `${formatCurrency(googleWastedSpend)} is being wasted on Google campaigns with no return. This budget could be reallocated to proven Meta campaigns or new creative testing.`,
      impact:   `Freeing ${formatCurrency(googleWastedSpend)}/month for reallocation.`,
      fix:      "Pause zero-conversion Google campaigns. Redirect 50% of recovered budget to Meta retargeting, 50% to creative testing.",
    });
  }

  return insights;
}

module.exports = { generateCrossInsights };
