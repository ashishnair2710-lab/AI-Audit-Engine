import { analyzeMeta }            from "../../lib/analyzers/analyzeMeta";
import { analyzeGoogle }          from "../../lib/analyzers/analyzeGoogle";
import { analyzeCompetitors }     from "../../lib/analyzers/analyzeCompetitors";
import { generateCrossInsights }  from "../../lib/analyzers/generateCrossInsights";
import { calculateScore }         from "../../lib/analyzers/calculateScore";
import { generateReport }         from "../../lib/analyzers/generateReport";
import { fetchMetaData }          from "../../lib/adAccounts/metaClient";
import { fetchGoogleData }        from "../../lib/adAccounts/googleClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    let { meta_data, google_data, competitor_data, use_live_data } = req.body;

    // ── Live data mode: pull from connected ad accounts ───────────────────
    if (use_live_data) {
      const metaToken   = req.cookies?.meta_access_token;
      const googleToken = req.cookies?.google_access_token;

      if (metaToken) {
        const adAccountId = req.cookies?.meta_ad_account_id;
        const liveMetaData = await fetchMetaData(metaToken, adAccountId);
        if (liveMetaData && !liveMetaData.error) meta_data = liveMetaData;
      }

      if (googleToken) {
        const customerId = req.cookies?.google_customer_id;
        const liveGoogleData = await fetchGoogleData(googleToken, customerId);
        if (liveGoogleData && !liveGoogleData.error) google_data = liveGoogleData;
      }
    }

    // ── Validate minimum input ─────────────────────────────────────────────
    if (!meta_data && !google_data) {
      return res.status(400).json({
        error: "At least one of meta_data or google_data is required.",
        hint:  "POST a JSON body with meta_data and/or google_data fields, or set use_live_data: true with connected accounts.",
      });
    }

    // ── Run analysis pipeline ─────────────────────────────────────────────
    const metaResult       = meta_data     ? analyzeMeta(meta_data)                         : emptyMeta();
    const googleResult     = google_data   ? analyzeGoogle(google_data)                     : emptyGoogle();
    const competitorResult = competitor_data ? analyzeCompetitors(competitor_data, meta_data) : emptyCompetitor();
    const crossInsights    = generateCrossInsights(metaResult, googleResult);
    const scoreResult      = calculateScore(metaResult, googleResult, competitorResult);
    const report           = generateReport(metaResult, googleResult, competitorResult, crossInsights, scoreResult);

    return res.status(200).json({
      success: true,
      data_source: use_live_data ? "live" : "provided",
      ...report,
    });

  } catch (err) {
    console.error("[AuditEngine] Error:", err);
    return res.status(500).json({
      error:   "Audit engine encountered an error.",
      message: err.message,
    });
  }
}

function emptyMeta() {
  return {
    issues: [], insights: [],
    funnel_presence: { tofu: false, mofu: false, bofu: false },
    budget_split:    { total_spend: 0, tofu_pct: 0, mofu_pct: 0, bofu_pct: 0 },
    signal_quality:  { pixel_active: false, capi_enabled: false },
    creative_system: { total_creatives: 0, has_video: false, formats: [] },
    audience_mix:    { broad: 0, interest: 0, retargeting: 0 },
    performance:     { total_spend: 0, total_impressions: 0, total_clicks: 0, total_conversions: 0 },
  };
}

function emptyGoogle() {
  return {
    issues: [], insights: [],
    summary: { total_spend: 0, total_conversions: 0, avg_roas: 0, wasted_spend: 0 },
    wasted_campaigns: [],
  };
}

function emptyCompetitor() {
  return {
    issues: [], insights: [], winning_ads: [],
    benchmarks: { user_creative_count: 0, avg_competitor_creative_count: 0, competitor_formats: [], user_formats: [] },
    competitors: [],
  };
}
