/**
 * Apify Facebook Ads Library scraper client.
 *
 * Actor: saswave/facebook-ads-library-scraper (ID: iSLC1yFR5dcET2DyC)
 * Docs: https://apify.com/saswave/facebook-ads-library-scraper
 * Cost: ~$1.50 / 1000 results
 *
 * Output shape (confirmed via live test):
 *   ad_archive_id, page_name, is_active, snapshot.body.text,
 *   snapshot.images[].resized_image_url, snapshot.videos[],
 *   snapshot.display_format, snapshot.title, snapshot.cta_text,
 *   snapshot.link_url, start_date, end_date (unix seconds or ISO)
 *
 * Required env var: APIFY_TOKEN
 */

const ACTOR_ID = "iSLC1yFR5dcET2DyC";
const BASE_URL = "https://api.apify.com/v2";

async function searchBrandApify(brand, opts = {}) {
  const token      = opts.token   || process.env.APIFY_TOKEN;
  const country    = opts.country || "AE";
  const maxResults = opts.limit   || 30;

  if (!token) {
    return { error: "APIFY_TOKEN is not set", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }

  const input = {
    keywords:      [brand],
    country,
    max_results:   maxResults,
    active_status: "ALL",
    ad_type:       "ALL",
    media_type:    "ALL",
    sort:          "DESCENDING",
    get_details:   false,
  };

  try {
    const endpoint = `${BASE_URL}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}&timeout=280&memory=1024`;

    const res = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Apify] Error response:", text.slice(0, 300));
      return { error: `Apify ${res.status}: ${text.slice(0, 200)}`, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    const ads = await res.json();

    if (!Array.isArray(ads)) {
      console.error("[Apify] Unexpected response:", JSON.stringify(ads).slice(0, 200));
      return { error: "Unexpected Apify response format", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    return shapeCompetitor(brand, ads);

  } catch (err) {
    console.error("[Apify] Fetch error:", err.message);
    return { error: err.message, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }
}

async function searchBrandsApify(brands, opts = {}) {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  return Promise.all(brands.map((b) => searchBrandApify(b, opts)));
}

/**
 * Map raw Apify output into our standard competitor record.
 * Fields are nested inside ad.snapshot — confirmed from live API response.
 */
function shapeCompetitor(brand, ads) {
  if (!Array.isArray(ads) || ads.length === 0) {
    return { brand, ad_count: 0, formats: [], hooks: [], duration_days: 0, ads: [] };
  }

  const formats = new Set();
  const hooks   = [];
  let maxDuration = 0;

  ads.forEach((ad) => {
    const snap = ad.snapshot || {};

    // ── Format ──────────────────────────────────────────────────────────────
    const fmt = (snap.display_format || "").toUpperCase();
    if (fmt === "VIDEO" || snap.videos?.length)       formats.add("video");
    else if (fmt === "DCO")                           formats.add("dynamic");
    else if (fmt === "CAROUSEL" || snap.cards?.length) formats.add("carousel");
    else                                              formats.add("image");

    // ── Hook ────────────────────────────────────────────────────────────────
    const body = snap.body?.text || snap.caption || snap.title || "";
    if (body) {
      const firstSentence = body.split(/[.!?\n]/)[0].trim().slice(0, 80);
      if (firstSentence) hooks.push(firstSentence);
    }

    // ── Duration ────────────────────────────────────────────────────────────
    const rawStart = ad.start_date || snap.start_date;
    if (rawStart) {
      const startDate = toDate(rawStart);
      const rawStop   = ad.end_date || snap.end_date;
      const endDate   = rawStop ? toDate(rawStop) : new Date();
      const days      = Math.round((endDate - startDate) / 86_400_000);
      if (days > maxDuration) maxDuration = days;
    }
  });

  return {
    brand,
    ad_count:      ads.length,
    formats:       [...formats],
    hooks:         [...new Set(hooks)].slice(0, 8),
    duration_days: maxDuration,
    ads: ads.slice(0, 8).map((a) => {
      const snap      = a.snapshot || {};
      const archiveId = a.ad_archive_id || "";

      // Best image: prefer resized (600px), fall back to original
      const image_url =
        snap.images?.[0]?.resized_image_url ||
        snap.images?.[0]?.original_image_url ||
        snap.extra_images?.[0]?.resized_image_url ||
        snap.cards?.[0]?.resized_image_url || "";

      const video_url =
        snap.videos?.[0]?.video_hd_url ||
        snap.videos?.[0]?.video_sd_url ||
        snap.extra_videos?.[0]?.video_hd_url || "";

      return {
        id:           archiveId,
        page_name:    a.page_name || snap.page_name || brand,
        page_picture: snap.page_profile_picture_url || "",
        body:         snap.body?.text || snap.caption || "",
        title:        snap.title || snap.cta_text || "",
        cta:          snap.cta_text || "",
        link_url:     snap.link_url || "",
        image_url,
        video_url,
        format:       (snap.display_format || "image").toLowerCase(),
        is_active:    a.is_active ?? true,
        snapshot_url: `https://www.facebook.com/ads/library/?id=${archiveId}`,
        platforms:    a.publisher_platforms || [],
        start:        a.start_date || snap.start_date || null,
        stop:         a.end_date   || snap.end_date   || null,
        impressions:  a.impressions_with_index?.impressions_text || null,
      };
    }),
  };
}

function toDate(raw) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw < 9_000_000_000 ? raw * 1000 : raw);
  return new Date(raw);
}

module.exports = { searchBrandApify, searchBrandsApify };
