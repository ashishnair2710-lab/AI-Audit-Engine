/**
 * Step 2 of Google OAuth flow.
 * Exchanges the auth code for access + refresh tokens, stores in httpOnly cookie.
 */
export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    return res.redirect(`/connect?error=google_denied`);
  }

  if (!code) {
    return res.redirect(`/connect?error=google_no_code`);
  }

  try {
    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri  = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[Google OAuth] Token exchange failed:", tokenData.error);
      return res.redirect(`/connect?error=google_token_failed`);
    }

    const { access_token, refresh_token } = tokenData;

    // Fetch user info for display
    const userRes  = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userRes.json();

    const cookieOptions = "HttpOnly; Path=/; Max-Age=604800; SameSite=Lax";
    const cookies = [
      `google_access_token=${access_token}; ${cookieOptions}`,
      `google_connected=true; Path=/; Max-Age=604800; SameSite=Lax`,
      `google_account_email=${encodeURIComponent(userData.email || "")}; Path=/; Max-Age=604800; SameSite=Lax`,
    ];

    if (refresh_token) {
      cookies.push(`google_refresh_token=${refresh_token}; ${cookieOptions}`);
    }

    res.setHeader("Set-Cookie", cookies);
    res.redirect(`/connect?success=google`);
  } catch (err) {
    console.error("[Google OAuth] Unexpected error:", err);
    res.redirect(`/connect?error=google_unexpected`);
  }
}
