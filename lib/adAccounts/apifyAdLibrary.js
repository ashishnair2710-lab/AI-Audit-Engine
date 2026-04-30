/**
 * Apify Facebook Ads Library scraper client.
 *
 * Uses the actor: curious_coder/facebook-ads-library-scraper
 * Docs: https://apify.com/curious_coder/facebook-ads-library-scraper
 *
 * No Meta identity confirmation required. Uses Apify's run-sync-get-dataset-items
 * endpoint so we get results back in one HTTP call.
 *
 * Required env var: APIFY_TOKEN
 */

const ACTOR_ID = "curious_coder~facebook-ads-library-scraper";
const ENDPOINT = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`;

/**
 * Search the Ad Library for one brand using Apify.
 * Returns the same shape as our Meta client so analyzeCompetitors() works unchanged.
 */
async function searchBrandApify(brand, opts = {}) {
  const token   = opts.token   || process.env.APIFY_TOKEN;
  const country = opts.country || "AE";
  const limit   = opts.limit   || 30;

  if (!token) {
    return { error: "APIFY_TOKEN is not set", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }

  // Build Ad Library search URL — Apify follows it and returns ads
  const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country}&q=${encodeURIComponent(brand)}&search_type=keyword_unordered`;

  const input = {
    urls:           [{ url: searchUrl }],
    "scrapeAdDetails": true,
    "scrapePageAds":   { "active_status": "all" },
    count:          limit,
  };

  try {
    const res = await fetch(`${ENDPOINT}?token=${token}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Apify ${res.status}: ${text.slice(0, 200)}`, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    const ads = await res.json();
    return shapeCompetitor(brand, ads);

  } catch (err) {
    return { error: err.message, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }
}

/**
 * Search multiple brands in parallel.
 */
async function searchBrandsApify(brands, opts = {}) {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  return Promise.all(brands.map((b) => searchBrandApify(b, opts)));
}

/**
 * Aggregate raw Apify ads into our competitor record shape.
 */
function shapeCompetitor(brand, ads) {
  if (!Array.isArray(ads) || ads.length === 0) {
    return { brand, ad_count: 0, formats: [], hooks: [], duration_days: 0, ads: [] };
  }

  const formats = new Set();
  const hooks   = [];
  let maxDuration = 0;

  ads.forEach((ad) => {
    // Format detection
    if (ad.video_urls?.length || ad.video_preview_image_url) formats.add("video");
    else if (ad.images?.length || ad.image_url)              formats.add("image");

    // Hook (first sentence of body)
    const body = ad.ad_creative_body || ad.body || ad.text || ad.description || "";
    if (body) {
      const firstSentence = body.split(/[.!?\n]/)[0].trim().slice(0, 80);
      if (firstSentence) hooks.push(firstSentence);
    }

    // Duration
    const start = ad.start_date || ad.ad_delivery_start_time;
    if (start) {
      const startDate = new Date(start * 1000 < 9e12 ? start * 1000 : start);
      const endDate   = ad.end_date ? new Date(ad.end_date * 1000 < 9e12 ? ad.end_date * 1000 : ad.end_date) : new Date();
      const days      = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (days > maxDuration) maxDuration = days;
    }
  });

  return {
    brand,
    ad_count:      ads.length,
    formats:       [...formats],
    hooks:         [...new Set(hooks)].slice(0, 8),
    duration_days: maxDuration,
    ads: ads.slice(0, 8).map((a) => ({
      id:           a.ad_archive_id || a.id || "",
      page_name:    a.page_name || brand,
      body:         a.ad_creative_body || a.body || a.text || "",
      title:        a.title || a.ad_creative_link_title || "",
      image_url:    a.image_url || a.images?.[0] || a.video_preview_image_url || "",
      video_url:    a.video_urls?.[0] || "",
      snapshot_url: a.snapshot_url || a.ad_snapshot_url || `https://www.facebook.com/ads/library/?id=${a.ad_archive_id || ""}`,
      platforms:    a.publisher_platforms || [],
      start:        a.start_date || a.ad_delivery_start_time,
      stop:         a.end_date   || a.ad_delivery_stop_time,
    })),
  };
}

module.exports = { searchBrandApify, searchBrandsApify };
