/**
 * Step 2 of Meta OAuth flow.
 * Exchanges the auth code for an access token, stores in httpOnly cookie.
 */
export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    return res.redirect(`/connect?error=meta_denied`);
  }

  if (!code) {
    return res.redirect(`/connect?error=meta_no_code`);
  }

  try {
    const appId       = process.env.META_APP_ID;
    const appSecret   = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/callback`;

    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code })
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[Meta OAuth] Token exchange failed:", tokenData.error);
      return res.redirect(`/connect?error=meta_token_failed`);
    }

    const shortToken = tokenData.access_token;

    // Exchange for long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type:        "fb_exchange_token",
        client_id:         appId,
        client_secret:     appSecret,
        fb_exchange_token: shortToken,
      })
    );
    const longTokenData = await longTokenRes.json();
    const accessToken   = longTokenData.access_token || shortToken;

    // Fetch available ad accounts
    const accountsRes  = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
    );
    const accountsData = await accountsRes.json();
    const firstAccount = accountsData?.data?.[0];

    // Store token in secure httpOnly cookie (7 days)
    const cookieOptions = "HttpOnly; Path=/; Max-Age=604800; SameSite=Lax";
    res.setHeader("Set-Cookie", [
      `meta_access_token=${accessToken}; ${cookieOptions}`,
      `meta_ad_account_id=${firstAccount?.id || ""}; ${cookieOptions}`,
      `meta_connected=true; Path=/; Max-Age=604800; SameSite=Lax`,
      `meta_account_name=${encodeURIComponent(firstAccount?.name || "Meta Account")}; Path=/; Max-Age=604800; SameSite=Lax`,
    ]);

    res.redirect(`/connect?success=meta`);
  } catch (err) {
    console.error("[Meta OAuth] Unexpected error:", err);
    res.redirect(`/connect?error=meta_unexpected`);
  }
}
