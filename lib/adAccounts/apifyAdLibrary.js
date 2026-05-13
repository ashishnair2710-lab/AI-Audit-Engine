/**
 * Apify Facebook Ads Library scraper client.
 *
 * Actor: apify/facebook-ads-scraper (ID: JJghSZmShuco4j9gJ)
 * Docs: https://apify.com/apify/facebook-ads-scraper
 *
 * Strategy: start run async → poll until done or 90s timeout → fetch dataset.
 * Input: startUrls pointing at Facebook Ads Library search page.
 *
 * Required env var: APIFY_TOKEN
 */

const ACTOR_ID = "JJghSZmShuco4j9gJ";
const BASE     = "https://api.apify.com/v2";

async function searchBrandApify(brand, opts = {}) {
  const token      = opts.token   || process.env.APIFY_TOKEN;
  const country    = opts.country || "AE";
  const maxResults = Math.min(opts.limit || 15, 20); // keep small → fast runs

  if (!token) {
    return { error: "APIFY_TOKEN is not set", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }

  // Build the Facebook Ads Library search URL
  const searchUrl =
    `https://www.facebook.com/ads/library/?active_status=all&ad_type=all` +
    `&country=${encodeURIComponent(country)}&q=${encodeURIComponent(brand)}&search_type=keyword_unordered`;

  const input = {
    startUrls:  [{ url: searchUrl }],
    maxResults,
  };

  try {
    // ── Step 1: start run (async) ─────────────────────────────────────────
    const startRes = await fetch(
      `${BASE}/acts/${ACTOR_ID}/runs?token=${token}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(input),
      }
    );

    if (!startRes.ok) {
      const txt = await startRes.text();
      return { error: `Apify start ${startRes.status}: ${txt.slice(0, 200)}`, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    const startData = await startRes.json();
    const runId     = startData?.data?.id;
    if (!runId) {
      return { error: "Apify did not return a run ID", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    // ── Step 2: poll until SUCCEEDED or timeout (90s) ────────────────────
    const deadline = Date.now() + 90_000;
    let   status   = startData?.data?.status || "RUNNING";

    while (["RUNNING", "READY"].includes(status) && Date.now() < deadline) {
      await sleep(4000);
      const pollRes  = await fetch(`${BASE}/actor-runs/${runId}?token=${token}`);
      const pollData = await pollRes.json();
      status         = pollData?.data?.status || status;
    }

    if (status !== "SUCCEEDED") {
      return { error: `Apify run ${status} after polling`, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    // ── Step 3: fetch dataset items ────────────────────────────────────────
    const datasetId = startData?.data?.defaultDatasetId;
    const itemsRes  = await fetch(
      `${BASE}/datasets/${datasetId}/items?token=${token}&limit=${maxResults}`
    );

    if (!itemsRes.ok) {
      return { error: `Apify dataset ${itemsRes.status}`, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    const ads = await itemsRes.json();

    if (!Array.isArray(ads)) {
      return { error: "Unexpected dataset format", brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
    }

    return shapeCompetitor(brand, ads);

  } catch (err) {
    console.error("[Apify] Error:", err.message);
    return { error: err.message, brand, ad_count: 0, formats: [], hooks: [], duration_days: 0 };
  }
}

async function searchBrandsApify(brands, opts = {}) {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  return Promise.all(brands.map((b) => searchBrandApify(b, opts)));
}

function shapeCompetitor(brand, ads) {
  if (!Array.isArray(ads) || ads.length === 0) {
    return { brand, ad_count: 0, formats: [], hooks: [], duration_days: 0, ads: [] };
  }

  const formats = new Set();
  const hooks   = [];
  let maxDuration = 0;

  ads.forEach((ad) => {
    const snap = ad.snapshot || {};

    // Format — new actor uses camelCase displayFormat
    const fmt = (snap.displayFormat || "").toUpperCase();
    if (fmt === "VIDEO" || snap.videos?.length)              formats.add("video");
    else if (fmt === "CAROUSEL" || fmt === "DPA" || snap.cards?.length) formats.add("carousel");
    else if (fmt === "DCO")                                  formats.add("dynamic");
    else                                                     formats.add("image");

    // Hook — body.text is unchanged
    const body = snap.body?.text || snap.caption || snap.title || "";
    if (body) {
      const first = body.split(/[.!?\n]/)[0].trim().slice(0, 80);
      if (first) hooks.push(first);
    }

    // Duration — new actor uses camelCase startDate / endDate (unix seconds)
    const rawStart = ad.startDate || snap.startDate;
    if (rawStart) {
      const s    = toDate(rawStart);
      const rawE = ad.endDate || snap.endDate;
      const e    = rawE ? toDate(rawE) : new Date();
      const days = Math.round((e - s) / 86_400_000);
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
      // New actor: adArchiveID or adArchiveId
      const archiveId = a.adArchiveID || a.adArchiveId || "";

      // Images: new actor uses camelCase resizedImageUrl / originalImageUrl
      const image_url =
        snap.images?.[0]?.resizedImageUrl  ||
        snap.images?.[0]?.originalImageUrl ||
        snap.extraImages?.[0]?.resizedImageUrl ||
        snap.cards?.[0]?.resizedImageUrl   || "";

      // Videos: new actor uses camelCase videoHdUrl / videoSdUrl
      const video_url =
        snap.videos?.[0]?.videoHdUrl ||
        snap.videos?.[0]?.videoSdUrl || "";

      return {
        id:           archiveId,
        // New actor: pageName (camelCase) at both top level and in snapshot
        page_name:    a.pageName || snap.pageName || brand,
        page_picture: snap.pageProfilePictureUrl || "",
        body:         snap.body?.text || snap.caption || "",
        title:        snap.title || snap.ctaText || "",
        cta:          snap.ctaText || "",
        link_url:     snap.linkUrl || "",
        image_url,
        video_url,
        format:       (snap.displayFormat || "image").toLowerCase(),
        // New actor: isActive (camelCase)
        is_active:    a.isActive ?? true,
        snapshot_url: `https://www.facebook.com/ads/library/?id=${archiveId}`,
        // New actor: publisherPlatform (singular, camelCase)
        platforms:    a.publisherPlatform || [],
        start:        a.startDate || null,
        stop:         a.endDate   || null,
        impressions:  a.impressionsWithIndex?.impressionsText || null,
      };
    }),
  };
}

function toDate(raw) {
  if (!raw) return new Date();
  if (typeof raw === "number") return new Date(raw < 9_000_000_000 ? raw * 1000 : raw);
  return new Date(raw);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { searchBrandApify, searchBrandsApify };
