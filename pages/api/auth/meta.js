/**
 * Step 1 of Meta OAuth flow.
 * Redirects the user to Meta's authorisation dialog.
 *
 * Required env vars:
 *   META_APP_ID
 *   META_APP_SECRET
 *   NEXT_PUBLIC_BASE_URL   (e.g. https://yourapp.com)
 */
export default function handler(req, res) {
  const appId       = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/callback`;

  if (!appId) {
    return res.status(500).json({ error: "META_APP_ID is not configured." });
  }

  const scopes = [
    "ads_read",
    "ads_management",
    "business_management",
  ].join(",");

  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  redirectUri,
    scope:         scopes,
    response_type: "code",
    state:         "meta_oauth_" + Date.now(), // CSRF protection
  });

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  res.redirect(authUrl);
}
