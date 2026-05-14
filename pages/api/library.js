import { searchBrand }      from "../../lib/adAccounts/metaLibraryClient";
import { searchBrandApify } from "../../lib/adAccounts/apifyAdLibrary";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const { brand, country = "AE", limit = "30" } = req.query;

  if (!brand || !brand.trim()) {
    return res.status(400).json({ error: "brand query param is required." });
  }

  const maxResults = Math.min(parseInt(limit, 10) || 30, 100);
  const opts       = { country, limit: maxResults };

  // ── 1. Meta Library API with system token (free, ~200ms) ─────────────────
  const libraryToken = process.env.META_LIBRARY_TOKEN;
  if (libraryToken) {
    const result = await searchBrand(brand.trim(), { ...opts, token: libraryToken });
    if (!result.error) {
      return res.status(200).json({ ...result, source: "meta_system" });
    }
    console.warn("[Library] Meta system token failed:", result.error);
  }

  // ── 2. User's connected Meta OAuth token (ads_read scope, free, ~200ms) ──
  const userToken = req.cookies?.meta_access_token;
  if (userToken) {
    const result = await searchBrand(brand.trim(), { ...opts, token: userToken });
    if (!result.error) {
      return res.status(200).json({ ...result, source: "meta_user" });
    }
    console.warn("[Library] Meta user token failed:", result.error);
  }

  // ── 3. Apify fallback (slower ~60-90s, costs money — last resort) ─────────
  if (process.env.APIFY_TOKEN) {
    const result = await searchBrandApify(brand.trim(), opts);
    if (!result.error) {
      return res.status(200).json({ ...result, source: "apify" });
    }
    console.warn("[Library] Apify failed:", result.error);
  }

  return res.status(503).json({
    error:   "No Ad Library source available.",
    hint:    "Connect your Meta account on /connect — the Ads Library uses your existing Meta login automatically. No extra setup needed.",
    sources: {
      meta_system: !!process.env.META_LIBRARY_TOKEN,
      meta_user:   !!userToken,
      apify:       !!process.env.APIFY_TOKEN,
    },
  });
}
