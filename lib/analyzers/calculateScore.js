const { SEVERITY } = require("../constants");
const { clamp } = require("../utils");

/**
 * Produces a 0–100 score across 4 dimensions (25 pts each).
 *
 * Funnel Completeness  — is TOFU / MOFU / BOFU all present?
 * Efficiency           — ROAS, wasted spend, CPA health
 * Signal Strength      — Pixel, CAPI, conversion tracking
 * Competitive Strength — creative volume vs competitors, format coverage
 */
function calculateScore(metaResult, googleResult, competitorResult) {
  let funnelScore      = 25;
  let efficiencyScore  = 25;
  let signalScore      = 25;
  let competitiveScore = 25;
  const breakdown      = {};

  // ── 1. Funnel Completeness (25 pts) ───────────────────────────────────────
  const funnel  = metaResult?.funnel_presence || {};
  const stages  = [funnel.tofu, funnel.mofu, funnel.bofu];
  const present = stages.filter(Boolean).length; // 0–3

  funnelScore = Math.round((present / 3) * 25);

  // Budget split health bonus (up to 0 pts deduction avoided)
  const tofuPct = metaResult?.budget_split?.tofu_pct || 0;
  if (tofuPct < 15 && present === 3) funnelScore = Math.max(funnelScore - 5, 0);

  breakdown.funnel = {
    score: funnelScore,
    max:   25,
    notes: `${present}/3 funnel stages active`,
  };

  // ── 2. Efficiency (25 pts) ────────────────────────────────────────────────
  const googleSumm   = googleResult?.summary || {};
  const avgRoas      = googleSumm.avg_roas   || 0;
  const wastedSpend  = googleSumm.wasted_spend || 0;
  const totalGSpend  = googleSumm.total_spend  || 1;
  const wastedPct    = (wastedSpend / totalGSpend) * 100;

  // ROAS scoring: 0=0, 1=5, 2=12, 3=20, 4+=25
  const roasScore = avgRoas >= 4 ? 25
    : avgRoas >= 3 ? 20
    : avgRoas >= 2 ? 12
    : avgRoas >= 1 ? 8
    : 3;

  // Wasted spend penalty
  const wastePenalty = wastedPct > 50 ? 10
    : wastedPct > 30 ? 6
    : wastedPct > 15 ? 3
    : 0;

  efficiencyScore = clamp(roasScore - wastePenalty, 0, 25);

  breakdown.efficiency = {
    score:       efficiencyScore,
    max:         25,
    avg_roas:    avgRoas,
    wasted_pct:  Math.round(wastedPct),
    notes:       `ROAS ${avgRoas}x, ${Math.round(wastedPct)}% spend wasted`,
  };

  // ── 3. Signal Strength (25 pts) ───────────────────────────────────────────
  const signal       = metaResult?.signal_quality || {};
  const pixelActive  = signal.pixel_active !== false;
  const capiEnabled  = signal.capi_enabled  !== false;

  signalScore = 0;
  if (pixelActive)  signalScore += 15;
  if (capiEnabled)  signalScore += 10;

  breakdown.signal = {
    score:        signalScore,
    max:          25,
    pixel_active: pixelActive,
    capi_enabled: capiEnabled,
    notes:        `Pixel: ${pixelActive ? "✓" : "✗"}, CAPI: ${capiEnabled ? "✓" : "✗"}`,
  };

  // ── 4. Competitive Strength (25 pts) ─────────────────────────────────────
  const benchmarks     = competitorResult?.benchmarks || {};
  const userCreatives  = benchmarks.user_creative_count        || 0;
  const avgCompCreat   = benchmarks.avg_competitor_creative_count || 0;
  const userFormats    = benchmarks.user_formats                || [];
  const compFormats    = benchmarks.competitor_formats          || [];
  const formatCoverage = compFormats.length > 0
    ? compFormats.filter((f) => userFormats.includes(f)).length / compFormats.length
    : 1;

  // Creative volume ratio
  const volumeRatio    = avgCompCreat > 0
    ? Math.min(userCreatives / avgCompCreat, 1)
    : 1;

  competitiveScore = Math.round((volumeRatio * 15) + (formatCoverage * 10));
  competitiveScore = clamp(competitiveScore, 0, 25);

  breakdown.competitive = {
    score:             competitiveScore,
    max:               25,
    creative_ratio:    `${userCreatives} vs avg ${avgCompCreat} competitor`,
    format_coverage:   `${Math.round(formatCoverage * 100)}%`,
    notes:             `${Math.round(volumeRatio * 100)}% creative volume parity, ${Math.round(formatCoverage * 100)}% format coverage`,
  };

  // ── Total ─────────────────────────────────────────────────────────────────
  const total = funnelScore + efficiencyScore + signalScore + competitiveScore;

  const grade =
    total >= 85 ? "A" :
    total >= 70 ? "B" :
    total >= 55 ? "C" :
    total >= 40 ? "D" : "F";

  const label =
    total >= 85 ? "Top Performance"    :
    total >= 70 ? "Healthy"            :
    total >= 55 ? "Needs Work"         :
    total >= 40 ? "Critical Issues"    : "Severe — Act Now";

  const color =
    total >= 85 ? "blue"   :
    total >= 70 ? "green"  :
    total >= 55 ? "yellow" :
    total >= 40 ? "orange" : "red";

  return {
    total: clamp(total, 0, 100),
    grade,
    label,
    color,
    breakdown,
  };
}

module.exports = { calculateScore };
