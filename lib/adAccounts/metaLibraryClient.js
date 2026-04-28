/**
 * Meta Ad Library API client.
 *
 * Public API — no user OAuth required. Uses a single app-level access token
 * (System User token from your Meta App with ads_archive permission).
 *
 * Docs: https://www.facebook.com/ads/library/api
 *
 * Required env var: META_LIBRARY_TOKEN
 *
 * Returns competitor data shaped for analyzeCompetitors():
 *   { brand, ad_count, formats, hooks, duration_days }
 */

const GRAPH_VERSION = "v19.0";
const ENDPOINT      = `https://graph.facebook.com/${GRAPH_VERSION}/ads_archive`;

/**
 * Search the Ad Library for one brand, return an aggregated competitor record.
 *
 * @param {string} brand        — brand name to search (e.g. "Nike")
 * @param {object} opts
 * @param {string} opts.country — ISO country code (default "AE")
 * @param {number} opts.limit   — max ads to fetch (default 50)
 * @param {string} opts.token   — override env token (optional)
 */
async function searchBrand(brand, opts = {}) {
  const token   = opts.token   || process.env.META_LIBRARY_TOKEN;
  const country = opts.country || "AE";
  const limit   = opts.limit   || 50;

  if (!token) {
    return { error: "META_LIBRARY_TOKEN is not set", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }
  if (!brand) {
    return { error: "brand is required", ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }

  const fields = [
    "id",
    "page_name",
    "ad_creative_bodies",
    "ad_creative_link_titles",
    "ad_snapshot_url",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "publisher_platforms",
    "ad_creative_link_descriptions",
  ].join(",");

  const url = new URL(ENDPOINT);
  url.searchParams.set("search_terms",         brand);
  url.searchParams.set("ad_reached_countries", `["${country}"]`);
  url.searchParams.set("ad_active_status",     "ALL");
  url.searchParams.set("ad_type",              "ALL");
  url.searchParams.set("fields",               fields);
  url.searchParams.set("limit",                String(limit));
  url.searchParams.set("access_token",         token);

  try {
    const res  = await fetch(url.toString());
    const json = await res.json();

    if (json.error) {
      return { error: json.error.message, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    const ads = json.data || [];
    return shapeCompetitor(brand, ads);

  } catch (err) {
    return { error: err.message, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }
}

/**
 * Search multiple competitor brands in parallel.
 * @param {string[]} brands
 * @param {object} opts
 */
async function searchBrands(brands, opts = {}) {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  const results = await Promise.all(brands.map((b) => searchBrand(b, opts)));
  return results.filter((r) => !r.error);
}

/**
 * Aggregate raw Ad Library ads into a single competitor record.
 */
function shapeCompetitor(brand, ads) {
  if (!ads.length) {
    return { brand, ad_count: 0, formats: [], hooks: [], duration_days: 0, ads: [] };
  }

  const formats = new Set();
  const hooks   = [];
  let maxDuration = 0;

  ads.forEach((ad) => {
    // Format detection — Ad Library doesn't expose creative type cleanly, infer from snapshot
    if (ad.ad_snapshot_url) {
      // Snapshot URLs contain a hint: video ads usually include "video" param
      if (/video/i.test(ad.ad_snapshot_url)) formats.add("video");
      else formats.add("image");
    }

    // Hooks — first sentence of each ad body
    const body = ad.ad_creative_bodies?.[0] || ad.ad_creative_link_titles?.[0];
    if (body) {
      const firstSentence = body.split(/[.!?\n]/)[0].trim().slice(0, 80);
      if (firstSentence) hooks.push(firstSentence);
    }

    // Duration in days
    if (ad.ad_delivery_start_time) {
      const start = new Date(ad.ad_delivery_start_time);
      const end   = ad.ad_delivery_stop_time ? new Date(ad.ad_delivery_stop_time) : new Date();
      const days  = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (days > maxDuration) maxDuration = days;
    }
  });

  return {
    brand,
    ad_count:      ads.length,
    formats:       [...formats],
    hooks:         [...new Set(hooks)].slice(0, 8),
    duration_days: maxDuration,
    // Keep the raw ads for the preview cards (snapshot_url, page_name, etc.)
    ads: ads.slice(0, 8).map((a) => ({
      id:           a.id,
      page_name:    a.page_name,
      body:         a.ad_creative_bodies?.[0] || "",
      title:        a.ad_creative_link_titles?.[0] || "",
      snapshot_url: a.ad_snapshot_url,
      platforms:    a.publisher_platforms || [],
      start:        a.ad_delivery_start_time,
      stop:         a.ad_delivery_stop_time,
    })),
  };
}

module.exports = { searchBrand, searchBrands };
