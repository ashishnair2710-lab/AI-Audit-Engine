/**
 * Google Ads API client.
 * Uses the Google Ads REST API (v16) to fetch campaign performance.
 *
 * Docs: https://developers.google.com/google-ads/api/docs/rest/overview
 *
 * Required env vars:
 *   GOOGLE_ADS_DEVELOPER_TOKEN   (from Google Ads API Center)
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 */

const GADS_API_BASE = "https://googleads.googleapis.com/v16";

export async function fetchGoogleData(accessToken, customerId) {
  if (!accessToken || !customerId) {
    return { error: "Missing Google access token or customer ID" };
  }

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) {
    return { error: "GOOGLE_ADS_DEVELOPER_TOKEN not configured" };
  }

  // Clean customer ID (remove dashes)
  const cleanCustomerId = customerId.replace(/-/g, "");

  try {
    // ── Campaign performance query ─────────────────────────────────────────
    const campaignQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        campaign.status,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.impressions,
        metrics.clicks,
        metrics.search_impression_share
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status = 'ENABLED'
      LIMIT 50
    `.trim();

    const campaignsRes = await fetch(
      `${GADS_API_BASE}/customers/${cleanCustomerId}/googleAds:search`,
      {
        method:  "POST",
        headers: {
          Authorization:        `Bearer ${accessToken}`,
          "developer-token":    developerToken,
          "Content-Type":       "application/json",
        },
        body: JSON.stringify({ query: campaignQuery }),
      }
    );

    const campaignsData = await campaignsRes.json();

    if (campaignsData.error) {
      console.error("[GoogleClient] API error:", campaignsData.error);
      return { error: campaignsData.error.message };
    }

    // ── Keyword performance query (Search only) ────────────────────────────
    const keywordQuery = `
      SELECT
        campaign.id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        metrics.cost_micros,
        metrics.conversions,
        metrics.clicks
      FROM keyword_view
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.advertising_channel_type = 'SEARCH'
      ORDER BY metrics.cost_micros DESC
      LIMIT 200
    `.trim();

    const keywordsRes  = await fetch(
      `${GADS_API_BASE}/customers/${cleanCustomerId}/googleAds:search`,
      {
        method:  "POST",
        headers: {
          Authorization:     `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "Content-Type":    "application/json",
        },
        body: JSON.stringify({ query: keywordQuery }),
      }
    );
    const keywordsData = await keywordsRes.json();

    // ── Transform to audit engine format ──────────────────────────────────
    const rows     = campaignsData.results || [];
    const kwRows   = keywordsData.results  || [];

    const campaigns = rows.map((row) => {
      const campaign = row.campaign;
      const metrics  = row.metrics;
      const spend    = (metrics.cost_micros || 0) / 1_000_000;
      const convs    = parseFloat(metrics.conversions || 0);
      const convVal  = parseFloat(metrics.conversions_value || 0);
      const roas     = spend > 0 && convVal > 0 ? Math.round((convVal / spend) * 100) / 100 : 0;

      const channelType = campaign.advertising_channel_type?.toLowerCase();
      const type = channelType === "shopping" ? "shopping" : "search";

      // Attach keywords for this campaign
      const campaignKeywords = kwRows
        .filter((kw) => kw.campaign?.id === campaign.id)
        .map((kw) => {
          const text      = kw.ad_group_criterion?.keyword?.text || "";
          const matchType = kw.ad_group_criterion?.keyword?.match_type || "";
          if (matchType === "EXACT")  return `[${text}]`;
          if (matchType === "PHRASE") return `"${text}"`;
          return text; // broad
        });

      return {
        id:          campaign.id,
        name:        campaign.name,
        type,
        status:      campaign.status,
        spend:       Math.round(spend),
        roas,
        conversions: Math.round(convs),
        keywords:    campaignKeywords,
        product_titles:      [],    // Populated via Merchant Center API (separate integration)
        feed_quality_score:  null,  // Populated via Merchant Center
      };
    });

    return { campaigns };

  } catch (err) {
    console.error("[GoogleClient] Fetch error:", err);
    return { error: err.message };
  }
}

/**
 * Refresh an expired Google access token using the stored refresh token.
 */
export async function refreshGoogleToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  return res.json();
}
