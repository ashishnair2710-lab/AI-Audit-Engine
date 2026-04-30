import { searchBrand }       from "../../lib/adAccounts/metaLibraryClient";
import { searchBrandApify }  from "../../lib/adAccounts/apifyAdLibrary";

/**
 * POST /api/competitors
 * Body: { brands: ["Nike","Adidas"], country?: "AE", source?: "apify"|"meta" }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { brands, country = "AE", source } = req.body || {};
  if (!Array.isArray(brands) || brands.length === 0) {
    return res.status(400).json({ error: "brands[] is required" });
  }

  // Auto-pick source: prefer Apify if token present
  const useApify = source === "apify" || (!source && process.env.APIFY_TOKEN);

  if (useApify && !process.env.APIFY_TOKEN) {
    return res.status(500).json({ error: "APIFY_TOKEN not configured" });
  }
  if (!useApify && !process.env.META_LIBRARY_TOKEN) {
    return res.status(500).json({ error: "META_LIBRARY_TOKEN not configured" });
  }

  try {
    const fn = useApify ? searchBrandApify : searchBrand;
    const results = await Promise.all(brands.map((b) => fn(b, { country })));
    return res.status(200).json({ success: true, source: useApify ? "apify" : "meta", competitors: results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
