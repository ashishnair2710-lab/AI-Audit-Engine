const { THRESHOLDS, SEVERITY } = require("../constants");
const { pct, categorizeCampaigns, sumField, safeDiv, issue, formatCurrency } = require("../utils");

function analyzeMeta(metaData, mode = "ecom") {
  if (!metaData?.campaigns?.length) {
    return { error: "No Meta campaign data provided", issues: [], score: 0 };
  }

  const campaigns  = metaData.campaigns;
  const issues     = [];
  const insights   = [];
  const isLeadGen  = mode === "leadgen";

  // ── Categorise funnel stages ──────────────────────────────────────────────
  const { tofu, mofu, bofu } = categorizeCampaigns(campaigns);

  const funnelPresence = {
    tofu: tofu.length > 0,
    mofu: mofu.length > 0,
    bofu: bofu.length > 0,
  };

  if (!funnelPresence.tofu) {
    issues.push(issue(
      SEVERITY.HIGH, "META_NO_TOFU",
      isLeadGen
        ? "No awareness campaigns to warm up cold audiences before the lead form"
        : "No awareness (TOFU) campaigns found",
      isLeadGen
        ? "Cold traffic sent straight to a lead form converts poorly. People need to know who you are first. CPL will be high and lead quality will be low."
        : "You are not building new demand. Google may be capturing intent you never created.this inflates CPA over time.",
      isLeadGen
        ? "Run 1-2 brand awareness campaigns before your lead campaigns. Video works best. Budget 20-30% here."
        : "Launch 1-2 broad awareness campaigns with video creative. Budget at least 30% of Meta spend here."
    ));
  }
  if (!funnelPresence.mofu) {
    issues.push(issue(
      SEVERITY.MEDIUM, "META_NO_MOFU",
      isLeadGen
        ? "No nurture campaigns between awareness and lead capture"
        : "No traffic/engagement (MOFU) campaigns found",
      isLeadGen
        ? "Leads generated from cold traffic without nurturing tend to be low quality. Sales cycles get longer and CPL goes up."
        : "Cold audiences skip straight to conversion pressure, reducing overall conversion rates.",
      isLeadGen
        ? "Add video view or engagement campaigns targeting warm audiences. Retarget video viewers (75%+) with your lead offer."
        : "Add consideration campaigns (traffic, video views, engagement) to warm audiences before retargeting."
    ));
  }
  if (!funnelPresence.bofu) {
    issues.push(issue(
      SEVERITY.HIGH, "META_NO_BOFU",
      isLeadGen
        ? "No lead generation campaigns running on Meta"
        : "No conversion (BOFU) campaigns found",
      isLeadGen
        ? "You are running awareness but not capturing any leads. All your Meta spend is going to views with no conversion."
        : "You are building awareness but not closing sales on Meta.",
      isLeadGen
        ? "Set up Lead Generation campaigns with Instant Forms or website lead events. Optimise for CompleteRegistration or Lead."
        : "Set up purchase/lead conversion campaigns with retargeting audiences."
    ));
  }

  // ── Budget allocation ─────────────────────────────────────────────────────
  const totalSpend    = sumField(campaigns, "spend");
  const tofuSpend     = sumField(tofu, "spend");
  const mofuSpend     = sumField(mofu, "spend");
  const bofuSpend     = sumField(bofu, "spend");
  const tofuPct       = pct(tofuSpend, totalSpend);
  const mofuPct       = pct(mofuSpend, totalSpend);
  const bofuPct       = pct(bofuSpend, totalSpend);

  if (tofuPct < THRESHOLDS.meta.minTofuBudgetPct && funnelPresence.tofu) {
    issues.push(issue(
      SEVERITY.MEDIUM, "META_LOW_TOFU_BUDGET",
      `TOFU budget is only ${tofuPct}% of Meta spend (min recommended: ${THRESHOLDS.meta.minTofuBudgetPct}%)`,
      "Under-investing in awareness shrinks your retargeting pool over time and raises future CPAs.",
      `Shift budget toward awareness to reach at least ${THRESHOLDS.meta.minTofuBudgetPct}% of total Meta spend.`
    ));
  }

  // ── Signal quality ────────────────────────────────────────────────────────
  const anyPixelOff  = campaigns.some((c) => c.pixel_active  === false);
  const anyCapiOff   = campaigns.some((c) => c.capi_enabled  === false);

  if (anyPixelOff) {
    issues.push(issue(
      SEVERITY.CRITICAL, "META_PIXEL_INACTIVE",
      "Meta Pixel is inactive on one or more campaigns",
      "Without Pixel data Meta cannot optimise delivery. Every AED spent is flying blind.CPAs will spike 30–70%.",
      "Verify Pixel installation on all key pages (checkout, thank-you, lead-confirm) via Meta Events Manager."
    ));
  }

  if (anyCapiOff) {
    issues.push(issue(
      SEVERITY.HIGH, "META_CAPI_DISABLED",
      "Conversions API (CAPI) is not enabled",
      "iOS 14+ privacy changes make browser-only tracking unreliable. Missing ~30% of conversion signals.",
      "Enable CAPI via Meta Business Manager. Use server-side events to recover lost signal."
    ));
  }

  // ── Creative system ───────────────────────────────────────────────────────
  const totalCreatives = sumField(campaigns, "creatives_count");
  const allFormats     = campaigns.flatMap((c) => c.creative_types || []);
  const hasVideo       = allFormats.includes("video");

  if (totalCreatives < THRESHOLDS.meta.minCreatives) {
    issues.push(issue(
      SEVERITY.HIGH, "META_LOW_CREATIVE_COUNT",
      `Only ${totalCreatives} creative${totalCreatives === 1 ? "" : "s"} running across all campaigns (min: ${THRESHOLDS.meta.minCreatives})`,
      "Creative fatigue sets in within 5–7 days with low volume. CPMs rise and CTRs drop as audiences become blind to repeated ads.",
      "Run at least 3–5 creative variations per ad set. Test different hooks, formats, and CTAs simultaneously."
    ));
  }

  if (!hasVideo) {
    issues.push(issue(
      SEVERITY.HIGH, "META_NO_VIDEO",
      "No video creative detected across Meta campaigns",
      "Video accounts for 60–80% of Meta delivery and drives 3× more engagement than static images.",
      "Produce at least one 15–30s video creative per funnel stage. UGC-style content consistently outperforms polished ads."
    ));
  }

  // ── Performance metrics ───────────────────────────────────────────────────
  const totalImpressions   = sumField(campaigns, "impressions");
  const totalClicks        = sumField(campaigns, "clicks");
  const totalConversions   = sumField(campaigns, "conversions");
  const totalConvValue     = sumField(campaigns, "conversion_value");
  const blendedCtr         = pct(totalClicks, totalImpressions);
  const blendedCvr         = pct(totalConversions, totalClicks);
  const costPerConversion  = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : null;
  const roas               = totalSpend > 0 && totalConvValue > 0
    ? Math.round((totalConvValue / totalSpend) * 100) / 100 : null;

  // Ad fatigue: impressions-per-creative. >50k = high fatigue signal.
  const totalCreativeCount  = sumField(campaigns, "creatives_count");
  const impressionsPerCreative = totalCreativeCount > 0
    ? Math.round(totalImpressions / totalCreativeCount) : 0;
  const adFatigueRate = Math.min(100, Math.round((impressionsPerCreative / 50000) * 100));
  const adFatigueLabel = adFatigueRate >= 75 ? "High" : adFatigueRate >= 40 ? "Medium" : "Low";

  if (blendedCtr < THRESHOLDS.meta.lowCtrPct && totalImpressions > 0) {
    issues.push(issue(
      SEVERITY.MEDIUM, "META_LOW_CTR",
      `Blended CTR is ${blendedCtr}% (benchmark: >${THRESHOLDS.meta.lowCtrPct}%)`,
      "Low CTR signals weak hooks or audience-creative mismatch.you're paying for impressions that don't convert to interest.",
      "Test new first-3-second hooks. Tighten audience targeting or refresh creative."
    ));
  }

  // ── Audience mix ──────────────────────────────────────────────────────────
  const hasRetargeting = campaigns.some(
    (c) => c.audience_type?.toLowerCase() === "retargeting"
  );
  const audienceMix = {
    broad:       campaigns.filter((c) => c.audience_type === "broad").length,
    interest:    campaigns.filter((c) => c.audience_type === "interest").length,
    retargeting: campaigns.filter((c) => c.audience_type === "retargeting").length,
  };

  if (!hasRetargeting) {
    issues.push(issue(
      SEVERITY.HIGH, "META_NO_RETARGETING",
      isLeadGen
        ? "No retargeting campaigns for people who visited but did not submit a lead"
        : "No retargeting campaigns found on Meta",
      isLeadGen
        ? "People who visited your landing page and left without submitting are your warmest audience. Not retargeting them means wasting the ad spend that brought them there."
        : "Website visitors and video viewers who didn't convert are being abandoned. Retargeting typically delivers 3-5x better ROAS than cold traffic.",
      isLeadGen
        ? "Retarget landing page visitors (30d) with a different angle: testimonials, FAQ, or a softer offer like a free resource. Also retarget video viewers (75%+)."
        : "Create retargeting ad sets targeting: website visitors (90d), video viewers (75%), add-to-cart (30d)."
    ));
  }

  // ── Lead Gen specific checks ──────────────────────────────────────────────
  if (isLeadGen) {
    const anyCapiOff = campaigns.some((c) => c.capi_enabled === false);
    if (anyCapiOff) {
      issues.push(issue(
        SEVERITY.HIGH, "META_LEADGEN_NO_CAPI",
        "Lead events are not being sent server-side via CAPI",
        "iOS 14+ blocks browser-based lead tracking. Without CAPI you are missing up to 30% of lead events. Meta optimises on bad data and CPL goes up.",
        "Set up CAPI to send Lead and CompleteRegistration events server-side. Match with browser events for deduplication."
      ));
    }

    const costPerLead = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : null;
    if (costPerLead && costPerLead > 500) {
      issues.push(issue(
        SEVERITY.MEDIUM, "META_HIGH_CPL",
        `Cost per lead is AED ${costPerLead} — above typical benchmarks`,
        "High CPL usually means the offer is weak, the audience is too cold, or the form has too many fields.",
        "Test a simpler offer (free guide, consultation, demo). Reduce form fields to 3 or fewer. Use Instant Forms rather than landing pages."
      ));
    }
  }

  // ── Build insights summary ────────────────────────────────────────────────
  if (totalCreatives >= 5 && hasVideo) {
    insights.push(isLeadGen
      ? "Creative system is healthy. Keep testing new hooks and lead magnets every 2 weeks."
      : "Creative system is healthy.maintain testing velocity with fresh hooks every 2 weeks.");
  }
  if (funnelPresence.tofu && funnelPresence.mofu && funnelPresence.bofu) {
    insights.push(isLeadGen
      ? "Full funnel is present. Focus on lead quality — check conversion rates from lead to qualified opportunity."
      : "Full funnel is present on Meta. Focus shifts to budget allocation and signal quality.");
  }

  return {
    issues,
    insights,
    funnel_presence: funnelPresence,
    budget_split: {
      total_spend:  totalSpend,
      tofu_pct:     tofuPct,
      mofu_pct:     mofuPct,
      bofu_pct:     bofuPct,
      tofu_spend:   tofuSpend,
      mofu_spend:   mofuSpend,
      bofu_spend:   bofuSpend,
    },
    signal_quality: {
      pixel_active:  !anyPixelOff,
      capi_enabled:  !anyCapiOff,
    },
    creative_system: {
      total_creatives: totalCreatives,
      has_video:       hasVideo,
      formats:         [...new Set(allFormats)],
    },
    audience_mix: audienceMix,
    top_creatives:             metaData.top_creatives             || rankCreatives(campaigns, "top"),
    underperforming_creatives: metaData.underperforming_creatives || rankCreatives(campaigns, "bottom"),
    performance: {
      total_spend:              totalSpend,
      total_impressions:        totalImpressions,
      total_clicks:             totalClicks,
      total_conversions:        totalConversions,
      total_conversion_value:   totalConvValue,
      blended_ctr:              blendedCtr,
      blended_cvr:              blendedCvr,
      cost_per_conversion:      costPerConversion,
      roas:                     roas,
      impressions_per_creative: impressionsPerCreative,
      ad_fatigue_rate:          adFatigueRate,
      ad_fatigue_label:         adFatigueLabel,
    },
  };
}

function rankCreatives(campaigns, dir) {
  const enriched = campaigns
    .filter((c) => (c.spend || 0) > 0 && (c.impressions || 0) > 0)
    .map((c) => {
      const spend = c.spend || 0;
      const conv  = c.conversions || 0;
      const ctr   = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return {
        name:        c.name || c.campaign_name || "Unnamed",
        label:       c.name || c.ad_name || "Untitled ad",
        format:      (c.creative_types || [])[0] || "image",
        thumbnail:   c.thumbnail_url || c.creative_image || null,
        spend, conversions: conv,
        roas:        c.roas ?? null,
        ctr:         Math.round(ctr * 100) / 100,
        cpa:         conv > 0 ? Math.round(spend / conv) : null,
      };
    });

  if (dir === "top") {
    return [...enriched].sort((a, b) => b.ctr - a.ctr).slice(0, 3);
  }
  // bottom = high spend + low CTR
  const medianSpend = enriched.map((c) => c.spend).sort((a, b) => a - b)[Math.floor(enriched.length / 2)] || 0;
  return enriched
    .filter((c) => c.spend >= medianSpend)
    .sort((a, b) => a.ctr - b.ctr)
    .slice(0, 3);
}

module.exports = { analyzeMeta };
