import { searchBrands } from "../../lib/adAccounts/metaLibraryClient";

/**
 * POST /api/competitors
 * Body: { brands: ["Nike","Adidas",...], country?: "AE", limit?: 50 }
 *
 * Returns competitor data shaped for analyzeCompetitors() + raw ads for preview cards.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { brands, country = "AE", limit = 50 } = req.body || {};
  if (!Array.isArray(brands) || brands.length === 0) {
    return res.status(400).json({ error: "brands[] is required" });
  }

  if (!process.env.META_LIBRARY_TOKEN) {
    return res.status(500).json({
      error: "META_LIBRARY_TOKEN not configured.",
      hint:  "Add it in Vercel → Settings → Environment Variables.",
    });
  }

  try {
    const results = await searchBrands(brands, { country, limit });
    return res.status(200).json({ success: true, competitors: results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
