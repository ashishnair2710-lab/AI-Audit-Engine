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

    // ── Fetch ad creatives separately (no insights edge — avoids silent failures
    //    on agency/managed accounts where the joined query returns nothing) ──
    const adsUrl =
      `${META_API_BASE}/${adAccountId}/ads?` +
      new URLSearchParams({
        access_token: accessToken,
        fields: [
          "name",
          "campaign_id",
          "adset_id",
          "status",
          "effective_status",
          "creative{thumbnail_url,image_url,object_story_spec{link_data{image_url,link},photo_data{url},video_data{image_url}},object_type,video_id}",
          "preview_shareable_link",
        ].join(","),
        // Fetch all statuses so we don't miss paused/archived ads
        effective_status: JSON.stringify(["ACTIVE","PAUSED","ARCHIVED","DELETED","ADSET_PAUSED","CAMPAIGN_PAUSED"]),
        limit: "200",
      });

    const adSetsRes  = await fetch(adsUrl);
    const adSetsData = await adSetsRes.json();

    // Build a campaign_id → insights map from the already-fetched campaign data
    const campaignInsightsMap = {};
    (campaignsData.data || []).forEach((c) => {
      const ins = c.insights?.data?.[0] || {};
      campaignInsightsMap[c.id] = {
        spend:       parseFloat(ins.spend || 0),
        impressions: parseInt(ins.impressions || 0),
        clicks:      parseInt(ins.clicks || 0),
        ctr:         parseFloat(ins.ctr || 0),
        conversions: (ins.actions || [])
          .filter((a) => ["purchase","lead","complete_registration"].includes(a.action_type))
          .reduce((s, a) => s + parseInt(a.value || 0), 0),
      };
    });

    // Build ranked ad-level creative list, correlating metrics from campaign map
    const adsRankedAll = (adSetsData?.data || []).map((ad) => {
      const cre       = ad.creative || {};
      const spec      = cre.object_story_spec || {};
      const thumbnail = cre.thumbnail_url
        || cre.image_url
        || spec.link_data?.image_url
        || spec.photo_data?.url
        || spec.video_data?.image_url
        || null;
      const format      = cre.video_id ? "video" : (cre.object_type || "image").toLowerCase();
      const preview_url = ad.preview_shareable_link || null;

      // Use campaign-level metrics to rank ads (best proxy when ad-level insights unavailable)
      const campMetrics = campaignInsightsMap[ad.campaign_id] || {};

      return {
        ad_id:       ad.id,
        campaign_id: ad.campaign_id,
        name:        ad.name,
        label:       ad.name,
        thumbnail,
        preview_url,
        format,
        ctr:         campMetrics.ctr         || 0,
        spend:       campMetrics.spend        || 0,
        impressions: campMetrics.impressions  || 0,
        clicks:      campMetrics.clicks       || 0,
        conversions: campMetrics.conversions  || 0,
        cpa:         campMetrics.conversions > 0
          ? Math.round(campMetrics.spend / campMetrics.conversions)
          : null,
      };
    });

    // Use ads pool; only fall back to campaign entries if the /ads endpoint truly returned nothing
    let pool = adsRankedAll;

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

      // Conversion value (revenue) from action_values
      const actionValues     = insights.action_values || [];
      const conversionValue  = actionValues
        .filter((a) => ["purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase"].includes(a.action_type))
        .reduce((sum, a) => sum + parseFloat(a.value || 0), 0);

      // Count ads (creatives) for this campaign
      const campaignAds = (adSetsData?.data || []).filter(
        (ad) => ad.campaign_id === campaign.id
      );

      return {
        id:               campaign.id,
        name:             campaign.name,
        type:             campaignType,
        status:           campaign.status,
        spend:            parseFloat(insights.spend       || 0),
        impressions:      parseInt(insights.impressions   || 0),
        clicks:           parseInt(insights.clicks        || 0),
        ctr:              parseFloat(insights.ctr         || 0),
        cpm:              parseFloat(insights.cpm         || 0),
        conversions,
        conversion_value: Math.round(conversionValue),
        creatives_count:  campaignAds.length,
        creative_types:   inferCreativeTypes(campaignAds),
        audience_type:    inferAudienceType(campaignAds),
        pixel_active:     pixelActive,
        capi_enabled:     false,
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
