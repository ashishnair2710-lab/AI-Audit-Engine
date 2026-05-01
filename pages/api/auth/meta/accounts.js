/**
 * GET /api/auth/meta/accounts
 * Returns the list of Meta ad accounts the connected user has access to.
 */
export default async function handler(req, res) {
  const token = req.cookies?.meta_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Meta" });

  try {
    const r = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency,business_name&limit=100&access_token=${token}`
    );
    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const accounts = (data.data || []).map((a) => ({
      id:       a.id,
      name:     a.name,
      currency: a.currency,
      status:   a.account_status === 1 ? "active" : "inactive",
      business: a.business_name || null,
    }));

    return res.status(200).json({ accounts, selected: req.cookies?.meta_ad_account_id || null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
