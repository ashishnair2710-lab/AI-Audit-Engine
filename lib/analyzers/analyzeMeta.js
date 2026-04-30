const { THRESHOLDS, SEVERITY } = require("../constants");
const { pct, categorizeCampaigns, sumField, safeDiv, issue, formatCurrency } = require("../utils");

function analyzeMeta(metaData) {
  if (!metaData?.campaigns?.length) {
    return { error: "No Meta campaign data provided", issues: [], score: 0 };
  }

  const campaigns = metaData.campaigns;
  const issues = [];
  const insights = [];

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
      "No awareness (TOFU) campaigns found",
      "You are not building new demand. Google may be capturing intent you never created — this inflates CPA over time.",
      "Launch 1–2 broad awareness campaigns with video creative. Budget at least 30% of Meta spend here."
    ));
  }
  if (!funnelPresence.mofu) {
    issues.push(issue(
      SEVERITY.MEDIUM, "META_NO_MOFU",
      "No traffic/engagement (MOFU) campaigns found",
      "Cold audiences skip straight to conversion pressure, reducing overall conversion rates.",
      "Add consideration campaigns (traffic, video views, engagement) to warm audiences before retargeting."
    ));
  }
  if (!funnelPresence.bofu) {
    issues.push(issue(
      SEVERITY.HIGH, "META_NO_BOFU",
      "No conversion (BOFU) campaigns found",
      "You are building awareness but not closing sales on Meta.",
      "Set up purchase/lead conversion campaigns with retargeting audiences."
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
      "Without Pixel data Meta cannot optimise delivery. Every AED spent is flying blind — CPAs will spike 30–70%.",
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
  const totalImpressions  = sumField(campaigns, "impressions");
  const totalClicks       = sumField(campaigns, "clicks");
  const totalConversions  = sumField(campaigns, "conversions");
  const blendedCtr        = pct(totalClicks, totalImpressions);
  const blendedCvr        = pct(totalConversions, totalClicks);
  const costPerConversion = totalConversions > 0
    ? Math.round(totalSpend / totalConversions)
    : null;

  if (blendedCtr < THRESHOLDS.meta.lowCtrPct && totalImpressions > 0) {
    issues.push(issue(
      SEVERITY.MEDIUM, "META_LOW_CTR",
      `Blended CTR is ${blendedCtr}% (benchmark: >${THRESHOLDS.meta.lowCtrPct}%)`,
      "Low CTR signals weak hooks or audience-creative mismatch — you're paying for impressions that don't convert to interest.",
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
      "No retargeting campaigns found on Meta",
      "Website visitors and video viewers who didn't convert are being abandoned. Retargeting typically delivers 3–5× better ROAS than cold traffic.",
      "Create retargeting ad sets targeting: website visitors (90d), video viewers (75%), add-to-cart (30d)."
    ));
  }

  // ── Build insights summary ────────────────────────────────────────────────
  if (totalCreatives >= 5 && hasVideo) {
    insights.push("Creative system is healthy — maintain testing velocity with fresh hooks every 2 weeks.");
  }
  if (funnelPresence.tofu && funnelPresence.mofu && funnelPresence.bofu) {
    insights.push("Full funnel is present on Meta. Focus shifts to budget allocation and signal quality.");
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
    top_creatives: rankCreatives(campaigns, "top"),
    underperforming_creatives: rankCreatives(campaigns, "bottom"),
    performance: {
      total_spend:          totalSpend,
      total_impressions:    totalImpressions,
      total_clicks:         totalClicks,
      total_conversions:    totalConversions,
      blended_ctr:          blendedCtr,
      blended_cvr:          blendedCvr,
      cost_per_conversion:  costPerConversion,
    },
  };
}

function rankCreatives(campaigns, dir) {
  const scored = campaigns
    .filter((c) => (c.spend || 0) > 0)
    .map((c) => {
      const spend       = c.spend || 0;
      const conv        = c.conversions || 0;
      const cpa         = conv > 0 ? spend / conv : null;
      const ctr         = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      const score       = c.roas != null
        ? c.roas
        : conv > 0 ? (conv / spend) * 100 : ctr;
      return {
        name:    c.name || c.campaign_name || "Unnamed campaign",
        format:  (c.creative_types || [])[0] || "image",
        spend,
        conversions: conv,
        roas:    c.roas ?? null,
        ctr:     Math.round(ctr * 100) / 100,
        cpa:     cpa ? Math.round(cpa) : null,
        score,
      };
    });

  scored.sort((a, b) => dir === "top" ? b.score - a.score : a.score - b.score);
  return scored.slice(0, 4);
}

module.exports = { analyzeMeta };
