/**
 * Clears all ad account OAuth cookies.
 * POST /api/auth/disconnect?platform=meta|google|all
 */
export default function handler(req, res) {
  const { platform } = req.query;
  const expired = "Path=/; Max-Age=0; SameSite=Lax";
  const cookies = [];

  if (platform === "meta" || platform === "all") {
    cookies.push(
      `meta_access_token=; ${expired}`,
      `meta_ad_account_id=; ${expired}`,
      `meta_connected=; ${expired}`,
      `meta_account_name=; ${expired}`
    );
  }

  if (platform === "google" || platform === "all") {
    cookies.push(
      `google_access_token=; ${expired}`,
      `google_refresh_token=; ${expired}`,
      `google_connected=; ${expired}`,
      `google_account_email=; ${expired}`,
      `google_customer_id=; ${expired}`
    );
  }

  if (cookies.length === 0) {
    return res.status(400).json({ error: "Specify platform=meta|google|all" });
  }

  res.setHeader("Set-Cookie", cookies);
  res.status(200).json({ success: true, disconnected: platform });
}
