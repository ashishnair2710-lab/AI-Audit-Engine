const { clamp } = require("../utils");

/**
 * Rubric-driven scoring. Returns overall + per-platform scores, verdicts,
 * and the full pass/fail rubric for both platforms.
 */
function calculateScore(metaResult, googleResult, competitorResult) {
  const mode = detectMode(metaResult, googleResult);
  const aov  = metaResult?.aov || googleResult?.aov || 0;

  const metaRubric   = runMetaRubric(metaResult, mode, aov);
  const googleRubric = runGoogleRubric(googleResult, mode, aov);
  const compRubric   = runCompetitiveRubric(metaResult, competitorResult);

  const meta   = scoreSet(metaRubric);
  const google = scoreSet(googleRubric);
  const comp   = scoreSet(compRubric);

  // Overall = weighted by points, all rubrics combined
  const overall = scoreSet([...metaRubric, ...googleRubric, ...compRubric]);

  // Dimensional rollup (legacy breakdown bars)
  const all = [...metaRubric, ...googleRubric, ...compRubric];
  const dim = (group) => {
    const items = all.filter((c) => c.dim === group);
    const got   = items.filter((c) => c.passed).reduce((s, c) => s + c.points, 0);
    const ttl   = items.reduce((s, c) => s + c.points, 0);
    return { score: ttl ? Math.round((got / ttl) * 25) : 0, max: 25, notes: `${got}/${ttl} pts` };
  };

  return {
    total:        overall.score,
    grade:        gradeFor(overall.score),
    label:        verdictFor(overall.score),
    color:        colorFor(overall.score),
    color_hex:    hexFor(overall.score),
    mode,
    aov,
    breakdown: {
      funnel:      dim("funnel"),
      efficiency:  dim("efficiency"),
      signal:      dim("signal"),
      competitive: dim("competitive"),
    },
    platforms: {
      meta:        { ...meta,   verdict: verdictFor(meta.score),   color: colorFor(meta.score),   color_hex: hexFor(meta.score),   rubric: metaRubric },
      google:      { ...google, verdict: verdictFor(google.score), color: colorFor(google.score), color_hex: hexFor(google.score), rubric: googleRubric },
      competitive: { ...comp,   verdict: verdictFor(comp.score),   color: colorFor(comp.score),   color_hex: hexFor(comp.score),   rubric: compRubric },
    },
    rubric: all.map((c) => ({ id: c.id, label: c.label, passed: c.passed, points: c.points, dim: c.dim, flag: c.flag, platform: c.platform })),
  };
}

function scoreSet(items) {
  const passed = items.filter((c) => c.passed).reduce((s, c) => s + c.points, 0);
  const max    = items.reduce((s, c) => s + c.points, 0) || 1;
  return { score: Math.round((passed / max) * 100), passed_pts: passed, total_pts: max };
}

// ─── BANDS ──────────────────────────────────────────────────────────────────
function verdictFor(s) {
  if (s >= 85) return "Elite — full funnel, signals, systematic testing";
  if (s >= 70) return "Strong — a few scaling rules to unlock";
  if (s >= 50) return "Developing — funnel and testing gaps remain";
  if (s >= 30) return "Below average — significant waste likely";
  return "Critical gaps — fix tracking first";
}
function gradeFor(s) {
  return s >= 85 ? "A" : s >= 70 ? "B" : s >= 50 ? "C" : s >= 30 ? "D" : "F";
}
function colorFor(s) {
  return s >= 85 ? "purple" : s >= 70 ? "green" : s >= 50 ? "blue" : s >= 30 ? "amber" : "red";
}
function hexFor(s) {
  return s >= 85 ? "#534AB7" : s >= 70 ? "#1D9E75" : s >= 50 ? "#378ADD" : s >= 30 ? "#EF9F27" : "#E24B4A";
}

// ─── MODE DETECTION ─────────────────────────────────────────────────────────
function detectMode(meta, google) {
  const sigs = [
    meta?.objective, google?.objective,
    ...(meta?.conversion_events || []),
    ...(google?.conversion_events || []),
  ].filter(Boolean).map((s) => String(s).toLowerCase());

  if (sigs.some((s) => s.includes("lead") || s.includes("form") || s.includes("signup") || s.includes("registration"))) return "leadgen";
  return "ecom";
}

// ─── META RUBRIC ────────────────────────────────────────────────────────────
function runMetaRubric(m, mode, aov) {
  if (!m) return [];
  const fp = m.funnel_presence || {};
  const sq = m.signal_quality  || {};
  const cs = m.creative_system || {};
  const am = m.audience_mix    || {};

  const fullFunnel    = fp.tofu && fp.mofu && fp.bofu;
  const twoStage      = (fp.tofu && fp.mofu) || (fp.mofu && fp.bofu) || (fp.tofu && fp.bofu);
  const enoughCreatives = (cs.total_creatives || 0) >= 2;
  const cboSplit      = (m.cbo_active === true) || ((am.broad || 0) + (am.interest || 0) > 0 && (am.retargeting || 0) > 0);
  const noOverlap     = m.audience_overlap_pct == null || m.audience_overlap_pct < 20;
  const refreshed7d   = (cs.days_since_last_creative || 99) <= 7;
  const refreshed14d  = (cs.days_since_last_creative || 99) <= 14;
  const fatigueMon    = (m.fatigue_monitored === true) || refreshed14d;
  const leadQuality   = (m.lead_quality_filter === true);

  const purchasePrimary = (m.primary_conversion || "").toLowerCase().includes("purchase");
  const leadPrimary     = (m.primary_conversion || "").toLowerCase().includes("lead");
  const aw              = (m.attribution_window || "").toLowerCase();
  const awHighTicket    = aw.includes("28") && aw.includes("7");
  const awEcom          = aov > 1000 ? awHighTicket : (aw.includes("7") || aw.includes("28"));
  const awLeadHigh      = aov > 1000 ? aw.includes("28") : true;

  const checks = [];

  if (mode === "ecom") {
    checks.push(
      meta("META_2_CREATIVES",  "2+ active creatives per ad set",                 enoughCreatives, 10, "signal",     "Single creative, no signal"),
      meta("META_PIXEL_CAPI",   "Pixel + CAPI both active",                       sq.pixel_active && sq.capi_enabled, 15, "signal", "Pixel only or CAPI only"),
      meta("META_PURCHASE_PRI", "Purchase set as primary conversion event",       purchasePrimary, 15, "signal",     "Optimising for traffic events"),
      meta("META_FULL_FUNNEL",  "Full funnel: awareness + traffic + conversion",  fullFunnel,      20, "funnel",     "Conversion-only, no upper funnel"),
      meta("META_AOV_AW",       "AOV-matched attribution window configured",      awEcom,          20, "signal",     "Default 7-day on high-ticket products"),
      meta("META_FATIGUE",      "Creative fatigue monitored by placement freq",   fatigueMon,      20, "efficiency", "High frequency, no creative refresh"),
      meta("META_CBO_SPLIT",    "CBO with prospecting + testing campaigns split", cboSplit,        30, "efficiency", "ABO only or single campaign"),
      meta("META_NO_OVERLAP",   "No significant audience overlap between ad sets",noOverlap,       30, "competitive","2+ ad sets targeting same segment"),
      meta("META_FRESH_7D",     "New formats, angles, offers tested every 7 days",refreshed7d,     40, "competitive","No new ads in last 14 days"),
    );
  } else {
    checks.push(
      meta("META_2_CREATIVES",  "2+ creatives per ad set",                        enoughCreatives, 10, "signal",     "Single creative, no signal"),
      meta("META_PIXEL_CAPI_LD","Pixel + CAPI with Lead event as primary",        sq.pixel_active && sq.capi_enabled && leadPrimary, 15, "signal", "Wrong primary conversion event"),
      meta("META_2_STAGE",      "Full funnel or minimum 2-stage (awareness→lead)",twoStage,        20, "funnel",     "Cold audience direct-to-lead"),
      meta("META_AW_LEAD",      "28-day click window for high-ticket lead gen",   awLeadHigh,      20, "signal",     "7-day default on long sales cycle"),
      meta("META_CBO_SPLIT",    "CBO prospecting + testing campaigns split",      cboSplit,        30, "efficiency", "ABO only"),
      meta("META_LEAD_QUALITY", "Lead quality filter — high-intent form or CAPI", leadQuality,     30, "signal",     "Default form, high junk lead risk"),
      meta("META_FRESH_7D",     "New formats, angles, lead magnet hooks weekly",  refreshed7d,     40, "competitive","No new ads in last 14 days"),
    );
  }

  return checks;
}

// ─── GOOGLE RUBRIC ──────────────────────────────────────────────────────────
function runGoogleRubric(g, mode, aov) {
  if (!g) return [];
  const s = g.summary  || {};
  const t = g.tracking || {};
  const totalSpend  = s.total_spend  || 1;
  const wastedPct   = ((s.wasted_spend || 0) / totalSpend) * 100;
  const avgRoas     = s.avg_roas || 0;
  const totalConv   = s.total_conversions || 0;
  const hasSearch   = (s.search_campaigns   || 0) > 0;
  const hasShopping = (s.shopping_campaigns || 0) > 0;
  const hasPMax     = (s.pmax_campaigns     || 0) > 0;
  const hasDemandGen= (s.demand_gen_campaigns||0) > 0;

  const ga4Linked    = t.ga4_linked === true;
  const noDup        = t.duplicate_conversion !== true;
  const purchasePrim = (t.primary_conversion || "").toLowerCase().includes("purchase");
  const leadPrim     = /lead|registration/i.test(t.primary_conversion || "");
  const merchantOk   = t.merchant_disapprovals === 0 || t.merchant_disapprovals == null;
  const brandSplit   = t.brand_nonbrand_split === true || (s.search_campaigns || 0) >= 2;
  const displayOff   = t.display_on_search !== true;
  const retargSplit  = t.retargeting_separated === true;
  const negKwFresh   = t.negatives_updated_days != null ? t.negatives_updated_days <= 7 : wastedPct < 30;
  const seasonalLab  = t.seasonal_labels === true;
  const presenceOnly = t.location_targeting === "presence";
  const assetGroups  = t.asset_groups_per_category === true;
  const customerLists= t.customer_lists_active === true;
  const finalUrlsOk  = t.final_urls_per_asset_group === true;
  const ytShorts     = t.youtube_shorts_active === true || hasDemandGen;
  const pmaxSplit    = t.pmax_display_dominance !== true;
  const tRoasFit     = avgRoas > 0 && totalConv >= 30;
  const tCpaFit      = totalConv >= 30;
  const rsaFresh     = t.rsa_refreshed_days != null ? t.rsa_refreshed_days <= 30 : true;
  const offlineConv  = t.offline_conversion === true;

  const checks = [];

  if (mode === "ecom") {
    checks.push(
      g_("G_TRACKING",     "GA4 linked + GCLID + UTM active",            ga4Linked,                10, "signal",     "Automation optimising on bad signals"),
      g_("G_PURCHASE_PRI", "Purchase as primary — soft events secondary",purchasePrim,             10, "signal",     "Soft events as primary conversion"),
      g_("G_NO_DUP",       "No duplicate conversion counting",           noDup,                    15, "signal",     "Inflated performance numbers"),
      g_("G_FEED_HEALTH",  "Merchant Center — zero disapprovals",        hasShopping && merchantOk,15, "efficiency", "Disapproved products in feed"),
      g_("G_BRAND_SPLIT",  "Brand vs non-brand in separate campaigns",   brandSplit,               15, "efficiency", "Mixed, no ROAS or cost control"),
      g_("G_DISPLAY_OFF",  "Display network OFF on Search campaigns",    displayOff,               15, "efficiency", "Opted in, budget leaking to display"),
      g_("G_FULL_FUNNEL",  "Full funnel: Search + Shopping/PMax + DG",   hasSearch && (hasShopping || hasPMax) && hasDemandGen, 20, "funnel", "Any pillar missing"),
      g_("G_RETARG_SPLIT", "Retargeting and prospecting separated",      retargSplit,              20, "efficiency", "Mixed audiences in same campaign"),
      g_("G_PMAX_CONTROL", "Search + Shopping running alongside PMax",   hasSearch && hasShopping && hasPMax, 20, "competitive", "PMax only, no control campaigns"),
      g_("G_NEG_KW",       "Negative keyword list reviewed weekly",      negKwFresh,               20, "efficiency", "Not updated in 30+ days"),
      g_("G_SEASONAL",     "Seasonal custom labels active in MC",        seasonalLab,              20, "competitive","No labels, no seasonal bid control"),
      g_("G_PRESENCE",     "Location targeting set to Presence only",    presenceOnly,             15, "efficiency", "Presence or interest selected"),
      g_("G_ASSET_GROUPS", "Asset groups aligned to product categories", assetGroups,              30, "competitive","Single group for full catalog"),
      g_("G_LTV_SIGNALS",  "Audience signals use high-LTV customer lists", customerLists,          30, "signal",     "Generic interest lists or no signals"),
      g_("G_FINAL_URLS",   "Final URLs controlled per asset group",      finalUrlsOk,              30, "efficiency", "Homepage as final URL"),
      g_("G_DG_SHORTS",    "Demand Gen + YouTube Shorts (9:16) active",  ytShorts && hasDemandGen, 30, "competitive","No Demand Gen, no signal feeding PMax"),
      g_("G_PMAX_SPLIT",   "PMax spend split monitored",                 pmaxSplit,                30, "efficiency", "Majority spend to Display with no conv"),
      g_("G_BID_VOLUME",   "Bidding strategy matched to volume — tROAS 30+/mo", tRoasFit,         30, "efficiency", "tROAS with under 30 conversions/month"),
      g_("G_CUSTOMER_LIST","Customer lists uploaded + refreshed monthly",customerLists,            40, "signal",     "No lists, PMax on generic signals"),
      g_("G_RSA_REFRESH",  "RSA assets tested and refreshed every 30 days", rsaFresh,              40, "competitive","Same assets untouched 60+ days"),
    );
  } else {
    checks.push(
      g_("G_TRACKING",     "GA4 linked + GCLID + UTM active",            ga4Linked,                10, "signal",     "Broken tracking"),
      g_("G_LEAD_PRI",     "Lead / CompleteRegistration as primary",     leadPrim,                 10, "signal",     "Soft event as primary"),
      g_("G_NO_DUP",       "No duplicate conversion counting",           noDup,                    15, "signal",     "Inflated CPL"),
      g_("G_BRAND_SPLIT",  "Brand vs non-brand in separate campaigns",   brandSplit,               15, "efficiency", "Brand cannibalising non-brand budget"),
      g_("G_FULL_FUNNEL",  "Full funnel: Search + Demand Gen active",    hasSearch && hasDemandGen,20, "funnel",     "Search-only, no demand creation"),
      g_("G_NEG_KW",       "Negative keyword list reviewed weekly",      negKwFresh,               20, "efficiency", "Not updated in 30+ days"),
      g_("G_OFFLINE",      "Offline conversion tracking — qualified leads", offlineConv,           30, "signal",     "Optimising on raw form fills only"),
      g_("G_DG_SHORTS",    "YouTube Shorts + Demand Gen (9:16)",         ytShorts && hasDemandGen, 30, "competitive","No signal loop into Search"),
      g_("G_TCPA_VOLUME",  "tCPA only with 30+/mo conversions",          tCpaFit,                  40, "efficiency", "tCPA with low volume, learning never exits"),
    );
  }

  return checks;
}

// ─── COMPETITIVE RUBRIC (placeholder for future) ────────────────────────────
function runCompetitiveRubric(meta, comp) {
  const b = comp?.benchmarks || {};
  const userCreatives  = b.user_creative_count || 0;
  const compAvg        = b.avg_competitor_creative_count || 0;
  const userFmts       = b.user_formats || [];
  const compFmts       = b.competitor_formats || [];
  const volumeParity   = compAvg > 0 ? userCreatives >= compAvg * 0.7 : true;
  const formatParity   = compFmts.length > 0 ? compFmts.every((f) => userFmts.includes(f)) : true;
  return [
    cmp("COMP_VOLUME", "Creative volume ≥ 70% of competitor avg", volumeParity, 20, "competitive", "Out-published — share-of-voice loss"),
    cmp("COMP_FORMAT", "Covering all competitor formats",         formatParity, 20, "competitive", "Missing format competitor uses"),
  ];
}

// ─── FACTORIES ──────────────────────────────────────────────────────────────
function meta(id, label, passed, points, dim, flag) { return { id, label, passed: !!passed, points, dim, flag, platform: "meta" }; }
function g_(id,  label, passed, points, dim, flag) { return { id, label, passed: !!passed, points, dim, flag, platform: "google" }; }
function cmp(id, label, passed, points, dim, flag) { return { id, label, passed: !!passed, points, dim, flag, platform: "competitive" }; }

module.exports = { calculateScore };
