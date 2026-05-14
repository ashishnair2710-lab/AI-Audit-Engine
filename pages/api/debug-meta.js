/**
 * Debug endpoint — shows raw Meta API responses for ads + creatives.
 * Hit: /api/debug-meta
 * Remove this file once the issue is diagnosed.
 */

const META_API_BASE = "https://graph.facebook.com/v19.0";

export default async function handler(req, res) {
  const accessToken  = req.cookies?.meta_access_token;
  const adAccountId  = req.cookies?.meta_ad_account_id;

  if (!accessToken || !adAccountId) {
    return res.status(400).json({ error: "No meta_access_token or meta_ad_account_id cookie found. Connect your account first." });
  }

  const results = {};

  // 1. Bare ads fetch — just id + name, no creative, no insights
  const bareUrl = `${META_API_BASE}/${adAccountId}/ads?` +
    new URLSearchParams({ access_token: accessToken, fields: "id,name,status,campaign_id", limit: "5" });
  const bareRes  = await fetch(bareUrl);
  const bareData = await bareRes.json();
  results.bare_ads = {
    count:  bareData?.data?.length ?? null,
    error:  bareData?.error ?? null,
    sample: bareData?.data?.slice(0, 2) ?? [],
  };

  // 2. Ads with creative thumbnail only
  if (bareData?.data?.length > 0) {
    const creativeUrl = `${META_API_BASE}/${adAccountId}/ads?` +
      new URLSearchParams({
        access_token: accessToken,
        fields: "id,name,creative{id,thumbnail_url,image_url,object_type}",
        limit: "5",
      });
    const creativeRes  = await fetch(creativeUrl);
    const creativeData = await creativeRes.json();
    results.ads_with_creative = {
      count:  creativeData?.data?.length ?? null,
      error:  creativeData?.error ?? null,
      sample: creativeData?.data?.slice(0, 2) ?? [],
    };
  }

  // 3. Ad creatives endpoint directly
  const acUrl = `${META_API_BASE}/${adAccountId}/adcreatives?` +
    new URLSearchParams({
      access_token: accessToken,
      fields: "id,name,thumbnail_url,image_url,object_type,object_story_spec{link_data{image_url},photo_data{url},video_data{image_url}}",
      limit: "5",
    });
  const acRes  = await fetch(acUrl);
  const acData = await acRes.json();
  results.adcreatives_endpoint = {
    count:  acData?.data?.length ?? null,
    error:  acData?.error ?? null,
    sample: acData?.data?.slice(0, 2) ?? [],
  };

  // 4. Token permissions
  const permUrl = `${META_API_BASE}/me/permissions?access_token=${accessToken}`;
  const permRes  = await fetch(permUrl);
  const permData = await permRes.json();
  results.token_permissions = permData?.data?.map((p) => `${p.permission}:${p.status}`) ?? permData?.error;

  return res.status(200).json(results);
}
