/**
 * Meta Ads API client.
 * Fetches campaign performance data and transforms it into the audit engine's input format.
 *
 * API version: v19.0
 * Docs: https://developers.facebook.com/docs/marketing-api/
 */

const META_API_BASE = "https://graph.facebook.com/v19.0";

// Date range builder
function getDateRange(days = 30) {
  const end   = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return {
    since: start.toISOString().split("T")[0],
    until: end.toISOString().split("T")[0],
  };
}

export async function fetchMetaData(accessToken, adAccountId, opts = {}) {
  if (!accessToken || !adAccountId) {
    return { error: "Missing Meta access token or ad account ID" };
  }

  try {
    const isLifetime = opts.days === "lifetime" || opts.days === 0 || opts.days === "0";

    // Date scope is embedded INSIDE the insights edge, not at top level
    const insightsScope = isLifetime
      ? `date_preset(maximum)`
      : `time_range(${JSON.stringify(getDateRange(opts.days || 30))})`;

    const fields = [
      "id", "name", "objective", "status",
      `insights.${insightsScope}{spend,impressions,clicks,ctr,actions,action_values,cpm,cpp}`,
    ].join(",");

    const campaignsUrl = `${META_API_BASE}/${adAccountId}/campaigns?` +
      new URLSearchParams({ access_token: accessToken, fields, limit: "50" });

    const campaignsRes  = await fetch(campaignsUrl);
    const campaignsData = await campaignsRes.json();

    if (campaignsData.error) {
      console.error("[MetaClient] API error:", campaignsData.error);
      return { error: campaignsData.error.message };
    }

    // Fetch ad-level data with creative thumbnails AND insights for ranking
    const adsUrl =
      `${META_API_BASE}/${adAccountId}/ads?` +
      new URLSearchParams({
        access_token: accessToken,
        fields: [
          "name",
          "campaign_id",
          "status",
          "creative{thumbnail_url,image_url,instagram_permalink_url,effective_object_story_id,object_type,video_id}",
          `insights.${insightsScope}{spend,impressions,clicks,ctr,actions}`,
          "targeting",
        ].join(","),
        limit: "200",
      });

    const adSetsRes  = await fetch(adsUrl);
    const adSetsData = await adSetsRes.json();

    // Build ranked ad-level creative list
    const adsRankedAll = (adSetsData?.data || []).map((ad) => {
      const ins   = ad.insights?.data?.[0] || {};
      const cre   = ad.creative || {};
      const ctr   = parseFloat(ins.ctr || 0);
      const spend = parseFloat(ins.spend || 0);
      const impr  = parseInt(ins.impressions || 0);
      const clicks= parseInt(ins.clicks || 0);
      const conv  = (ins.actions || [])
        .filter((a) => ["purchase","lead","complete_registration"].includes(a.action_type))
        .reduce((s, a) => s + parseInt(a.value || 0), 0);
      const thumbnail = cre.thumbnail_url || cre.image_url || null;
      const format = cre.video_id ? "video" : (cre.object_type || "image").toLowerCase();
      return {
        ad_id: ad.id,
        campaign_id: ad.campaign_id,
        name: ad.name,
        label: ad.name,
        thumbnail,
        format,
        ctr, spend,
        impressions: impr,
        clicks,
        conversions: conv,
        cpa: conv > 0 ? Math.round(spend / conv) : null,
      };
    });

    // Prefer ads with real performance data; fall back to any ads with thumbnails
    const withMetrics = adsRankedAll.filter((a) => a.impressions > 0);
    const pool        = withMetrics.length ? withMetrics : adsRankedAll.filter((a) => a.thumbnail);

    const top_creatives = [...pool].sort((a, b) => b.ctr - a.ctr).slice(0, 3);
    const medianSpend = pool.map((a) => a.spend).sort((x, y) => x - y)[Math.floor(pool.length / 2)] || 0;
    const underperforming_creatives = (pool.filter((a) => a.spend >= medianSpend).length
      ? pool.filter((a) => a.spend >= medianSpend)
      : pool)
      .slice()
      .sort((a, b) => a.ctr - b.ctr)
      .slice(0, 3);

    // Fetch pixel status
    const pixelsUrl =
      `${META_API_BASE}/${adAccountId}/adspixels?` +
      new URLSearchParams({ access_token: accessToken, fields: "id,name,last_fired_time" });

    const pixelsRes  = await fetch(pixelsUrl);
    const pixelsData = await pixelsRes.json();
    const pixelActive = (pixelsData?.data?.length || 0) > 0 &&
      pixelsData.data.some((p) => p.last_fired_time);

    // Transform to audit engine format
    const campaigns = (campaignsData.data || []).map((campaign) => {
      const insights    = campaign.insights?.data?.[0] || {};
      const actions     = insights.actions             || [];
      const conversions = actions
        .filter((a) => ["purchase", "lead", "complete_registration"].includes(a.action_type))
        .reduce((sum, a) => sum + parseInt(a.value || 0), 0);

      const objective    = (campaign.objective || "").toLowerCase();
      const campaignType = mapObjectiveToType(objective);

      // Count ads (creatives) for this campaign
      const campaignAds = (adSetsData?.data || []).filter(
        (ad) => ad.campaign_id === campaign.id
      );

      return {
        id:              campaign.id,
        name:            campaign.name,
        type:            campaignType,
        status:          campaign.status,
        spend:           parseFloat(insights.spend  || 0),
        impressions:     parseInt(insights.impressions || 0),
        clicks:          parseInt(insights.clicks    || 0),
        ctr:             parseFloat(insights.ctr     || 0),
        conversions,
        creatives_count: campaignAds.length,
        creative_types:  inferCreativeTypes(campaignAds),
        audience_type:   inferAudienceType(campaignAds),
        pixel_active:    pixelActive,
        capi_enabled:    false, // Cannot be determined via API — user must confirm
      };
    });

    return { campaigns, top_creatives, underperforming_creatives };

  } catch (err) {
    console.error("[MetaClient] Fetch error:", err);
    return { error: err.message };
  }
}

function mapObjectiveToType(objective) {
  if (["brand_awareness", "reach", "video_views"].includes(objective)) return "awareness";
  if (["traffic", "post_engagement", "page_likes"].includes(objective))  return "traffic";
  if (["conversions", "catalog_sales", "store_traffic"].includes(objective)) return "conversion";
  return "traffic";
}

function inferCreativeTypes(ads) {
  // Without fetching individual creative objects, return a baseline
  // A full implementation would fetch creative.object_type per ad
  return ads.length > 0 ? ["image"] : [];
}

function inferAudienceType(ads) {
  // Simplified — full implementation inspects targeting spec
  return "interest";
}
