import { searchBrandApify } from "../../lib/adAccounts/apifyAdLibrary";
import { searchBrand }      from "../../lib/adAccounts/metaLibraryClient";

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

  // ── Prefer Apify (richer data, no Meta identity verification needed) ──────
  if (process.env.APIFY_TOKEN) {
    const result = await searchBrandApify(brand.trim(), opts);
    if (!result.error) {
      return res.status(200).json({ ...result, source: "apify" });
    }
    console.warn("[Library] Apify failed, falling back to Meta Library API:", result.error);
  }

  // ── Fallback: Meta Ad Library API ────────────────────────────────────────
  if (process.env.META_LIBRARY_TOKEN) {
    const result = await searchBrand(brand.trim(), opts);
    if (!result.error) {
      return res.status(200).json({ ...result, source: "meta" });
    }
    return res.status(502).json({ error: result.error });
  }

  return res.status(503).json({
    error: "No Ad Library source configured.",
    hint:  "Set APIFY_TOKEN (recommended) or META_LIBRARY_TOKEN in your .env.local file.",
  });
}
