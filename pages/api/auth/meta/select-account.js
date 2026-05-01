/**
 * POST /api/auth/meta/select-account { account_id, account_name }
 * Stores the user's chosen ad account in cookies.
 */
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { account_id, account_name } = req.body || {};
  if (!account_id) return res.status(400).json({ error: "account_id required" });

  const cookieOpts = "Path=/; Max-Age=604800; SameSite=Lax";
  res.setHeader("Set-Cookie", [
    `meta_ad_account_id=${account_id}; HttpOnly; ${cookieOpts}`,
    `meta_account_name=${encodeURIComponent(account_name || "Meta Account")}; ${cookieOpts}`,
  ]);
  return res.status(200).json({ success: true });
}
