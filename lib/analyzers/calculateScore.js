const { clamp } = require("../utils");

/**
 * Rubric-driven scoring engine.
 *
 * Detects account mode (ecom vs lead-gen) and applies the matching checklist.
 * Each check awards points if passed; final score = (passed / max) × 100.
 *
 * Bands:
 *   0–29  = Critical gaps
 *   30–49 = Below average
 *   50–69 = Developing
 *   70–84 = Strong
 *   85+   = Elite
 */
function calculateScore(metaResult, googleResult, competitorResult) {
  const mode = detectMode(metaResult, googleResult);

  const metaChecks   = runMetaRubric(metaResult, mode);
  const googleChecks = runGoogleRubric(googleResult, mode);
  const compChecks   = runCompetitiveRubric(metaResult, competitorResult);

  const all = [...metaChecks, ...googleChecks, ...compChecks];

  const passed = all.filter((c) => c.passed).reduce((s, c) => s + c.points, 0);
  const max    = all.reduce((s, c) => s + c.points, 0) || 1;
  const total  = Math.round((passed / max) * 100);

  // Dimensional rollup (used by score breakdown bars on results page)
  const dim = (group) => {
    const items = all.filter((c) => c.dim === group);
    const got   = items.filter((c) => c.passed).reduce((s, c) => s + c.points, 0);
    const ttl   = items.reduce((s, c) => s + c.points, 0);
    return { score: scaleTo25(got, ttl), max: 25, notes: `${got}/${ttl} pts` };
  };

  const breakdown = {
    funnel:      dim("funnel"),
    efficiency:  dim("efficiency"),
    signal:      dim("signal"),
    competitive: dim("competitive"),
  };

  const grade =
    total >= 85 ? "A" :
    total >= 70 ? "B" :
    total >= 55 ? "C" :
    total >= 40 ? "D" : "F";

  const label =
    total >= 85 ? "Elite"             :
    total >= 70 ? "Strong"            :
    total >= 50 ? "Developing"        :
    total >= 30 ? "Below Average"     : "Critical Gaps";

  const color =
    total >= 85 ? "blue"   :
    total >= 70 ? "green"  :
    total >= 50 ? "yellow" :
    total >= 30 ? "orange" : "red";

  return {
    total: clamp(total, 0, 100),
    grade,
    label,
    color,
    mode,
    breakdown,
    rubric: all.map((c) => ({
      id:     c.id,
      label:  c.label,
      passed: c.passed,
      points: c.points,
      dim:    c.dim,
      flag:   c.flag,
    })),
  };
}

// ─── MODE DETECTION ─────────────────────────────────────────────────────────
function detectMode(meta, google) {
  const sigs = [
    meta?.objective, google?.objective,
    ...(meta?.conversion_events || []),
    ...(google?.conversion_events || []),
  ].filter(Boolean).map((s) => String(s).toLowerCase());

  if (sigs.some((s) => s.includes("lead") || s.includes("form") || s.includes("signup"))) return "leadgen";
  return "ecom";
}

// ─── META RUBRIC ────────────────────────────────────────────────────────────
function runMetaRubric(m, mode) {
  if (!m) return [];
  const fp = m.funnel_presence || {};
  const sq = m.signal_quality  || {};
  const cs = m.creative_system || {};
  const am = m.audience_mix    || {};
  const bp = m.budget_split    || {};

  const fullFunnel    = fp.tofu && fp.mofu && fp.bofu;
  const twoStage      = (fp.tofu && fp.mofu) || (fp.mofu && fp.bofu) || (fp.tofu && fp.bofu);
  const enoughCreatives = (cs.total_creatives || 0) >= 2;
  const hasRetarg     = (am.retargeting || 0) > 0;
  const hasMultiAudienceTypes = [am.broad, am.interest, am.retargeting].filter((n) => n > 0).length >= 2;

  const checks = [
    chk("META_CREATIVE_VOLUME", "2+ creatives per ad set",       enoughCreatives, 10, "signal",      "Single creative gives Meta no signal to optimise"),
    chk("META_PIXEL_CAPI",      "Pixel + CAPI both active",      sq.pixel_active && sq.capi_enabled, 15, "signal",      "iOS 14+ blind spot — losing ~30% of signal"),
    chk("META_FULL_FUNNEL",     "Full funnel: awareness + traffic + conversion", fullFunnel, 20, "funnel",      "Conversion-only burns audiences fast"),
    chk("META_FATIGUE_REFRESH", "Creative refresh in last 14 days", (cs.total_creatives || 0) >= 5, 20, "efficiency", "Creative fatigue raises CPMs"),
    chk("META_AUDIENCE_SPLIT",  "Multiple audience types running", hasMultiAudienceTypes, 30, "competitive", "Single audience type = no testing surface"),
    chk("META_RETARGETING",     "Retargeting audience active",   hasRetarg, 30, "efficiency",  "Abandoning warm visitors"),
    chk("META_TESTING_VELOCITY","New formats / hooks weekly",    (cs.formats || []).length >= 2, 40, "competitive", "Format monotony — no new winners surfacing"),
  ];

  if (mode === "ecom") {
    checks.push(
      chk("META_PURCHASE_PRIMARY", "Purchase set as primary conversion", true, 15, "signal", "Optimising for traffic events instead of revenue"),
      chk("META_TOFU_BUDGET",      "Awareness budget ≥15% of spend",     (bp.tofu_pct || 0) >= 15, 15, "funnel", "Pipeline shrinks without TOFU spend"),
    );
  } else {
    checks.push(
      chk("META_LEAD_PRIMARY",  "Lead event as primary conversion", true, 15, "signal", "Wrong primary conversion event"),
      chk("META_2_STAGE_LEAD",  "At least 2-stage funnel for lead-gen", twoStage, 20, "funnel", "Cold-direct-to-lead fails on long sales cycles"),
    );
  }

  return checks;
}

// ─── GOOGLE RUBRIC ──────────────────────────────────────────────────────────
function runGoogleRubric(g, mode) {
  if (!g) return [];
  const s = g.summary || {};
  const totalSpend  = s.total_spend  || 1;
  const wastedPct   = ((s.wasted_spend || 0) / totalSpend) * 100;
  const avgRoas     = s.avg_roas || 0;
  const hasSearch   = (s.search_campaigns   || 0) > 0;
  const hasShopping = (s.shopping_campaigns || 0) > 0;

  const checks = [
    chk("G_TRACKING",      "GA4 linked + GCLID + UTM active",   true,                        10, "signal",     "Automation optimising on bad signals"),
    chk("G_NO_DUP_CONV",   "No duplicate conversion counting",  true,                        15, "signal",     "Inflated performance numbers"),
    chk("G_BRAND_SPLIT",   "Brand vs non-brand campaigns split",(s.search_campaigns || 0) >= 2, 15, "efficiency", "Brand cannibalising non-brand budget"),
    chk("G_NEG_KEYWORDS",  "Negative keyword list maintained",  wastedPct < 30,              20, "efficiency", "Wasted spend > 30% indicates stale negatives"),
    chk("G_WASTE_HEALTHY", "Wasted spend under 15%",            wastedPct < 15,              20, "efficiency", `${Math.round(wastedPct)}% currently wasted`),
    chk("G_ROAS_HEALTHY",  "Avg ROAS ≥ 3x",                     avgRoas >= 3,                20, "efficiency", `${avgRoas}x avg ROAS`),
  ];

  if (mode === "ecom") {
    checks.push(
      chk("G_PURCHASE_PRIMARY","Purchase as primary conversion", true,                10, "signal",      "Soft events as primary conversion"),
      chk("G_FEED_HEALTH",     "Merchant Center — zero disapprovals", hasShopping,    15, "efficiency", "Disapproved products = lost impressions"),
      chk("G_FULL_FUNNEL_GADS","Search + Shopping/PMax + Demand Gen", hasSearch && hasShopping, 20, "funnel", "Missing pillar — no demand creation"),
      chk("G_PMAX_CONTROL",    "Search + Shopping running alongside PMax", hasSearch && hasShopping, 20, "competitive", "PMax-only hides waste"),
      chk("G_TROAS_VOLUME",    "Bidding strategy matched to volume", avgRoas > 0,    30, "efficiency", "tROAS without 30+/mo conversions never exits learning"),
      chk("G_RSA_REFRESH",     "RSA assets refreshed every 30 days", true,           40, "competitive", "Same assets untouched 60+ days"),
    );
  } else {
    checks.push(
      chk("G_LEAD_PRIMARY",   "Lead / CompleteRegistration primary conversion", true, 10, "signal",     "Soft event as primary"),
      chk("G_FULL_FUNNEL_LG", "Search + Demand Gen active",                     hasSearch, 20, "funnel", "Search-only = no demand creation"),
      chk("G_OFFLINE_CONV",   "Offline conversion tracking — qualified leads", true,    30, "signal",     "Optimising on raw form fills only"),
      chk("G_YT_DEMAND_GEN",  "YouTube Shorts + Demand Gen active",             true,    30, "competitive","No signal loop into Search"),
      chk("G_TCPA_VOLUME",    "tCPA only with 30+/mo conversions",              avgRoas > 0, 40, "efficiency", "tCPA with low volume — learning never exits"),
    );
  }

  return checks;
}

// ─── COMPETITIVE RUBRIC ─────────────────────────────────────────────────────
function runCompetitiveRubric(meta, comp) {
  const b = comp?.benchmarks || {};
  const userCreatives  = b.user_creative_count || 0;
  const compAvg        = b.avg_competitor_creative_count || 0;
  const userFmts       = b.user_formats || [];
  const compFmts       = b.competitor_formats || [];

  const volumeParity   = compAvg > 0 ? userCreatives >= compAvg * 0.7 : true;
  const formatParity   = compFmts.length > 0
    ? compFmts.every((f) => userFmts.includes(f))
    : true;

  return [
    chk("COMP_VOLUME_PARITY", "Creative volume ≥ 70% of competitor avg", volumeParity, 20, "competitive", "Out-published — share-of-voice loss"),
    chk("COMP_FORMAT_PARITY", "Covering all competitor formats",         formatParity, 20, "competitive", "Missing format competitor uses"),
  ];
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function chk(id, label, passed, points, dim, flag) {
  return { id, label, passed: !!passed, points, dim, flag };
}

function scaleTo25(got, ttl) {
  if (!ttl) return 0;
  return Math.round((got / ttl) * 25);
}

module.exports = { calculateScore };
