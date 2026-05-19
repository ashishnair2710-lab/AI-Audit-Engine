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

export async function fetchGoogleData(accessToken, customerId, opts = {}) {
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

    // ── Search terms report (actual queries that triggered ads) ───────────
    const searchTermQuery = `
      SELECT
        search_term_view.search_term,
        campaign.id,
        campaign.name,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions,
        metrics.ctr
      FROM search_term_view
      WHERE segments.date DURING LAST_30_DAYS
        AND metrics.cost_micros > 0
      ORDER BY metrics.cost_micros DESC
      LIMIT 500
    `.trim();

    let searchTermsData = { results: [] };
    try {
      const stRes = await fetch(
        `${GADS_API_BASE}/customers/${cleanCustomerId}/googleAds:search`,
        {
          method:  "POST",
          headers: {
            Authorization:     `Bearer ${accessToken}`,
            "developer-token": developerToken,
            "Content-Type":    "application/json",
          },
          body: JSON.stringify({ query: searchTermQuery }),
        }
      );
      searchTermsData = await stRes.json();
      if (searchTermsData.error) {
        console.warn("[GoogleClient] Search terms query failed:", searchTermsData.error.message);
        searchTermsData = { results: [] };
      }
    } catch (e) {
      console.warn("[GoogleClient] Search terms fetch failed:", e.message);
    }

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
        id:               campaign.id,
        name:             campaign.name,
        type,
        status:           campaign.status,
        spend:            Math.round(spend),
        impressions:      parseInt(metrics.impressions || 0),
        clicks:           parseInt(metrics.clicks      || 0),
        roas,
        conversions:      Math.round(convs),
        conversion_value: Math.round(convVal),
        keywords:         campaignKeywords,
        product_titles:      [],
        feed_quality_score:  null,
      };
    });

    // ── Top ads query (RSA headlines + descriptions) ──────────────────────
    const adQuery = `
      SELECT
        campaign.id,
        campaign.name,
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.expanded_text_ad.headline_part1,
        ad_group_ad.ad.expanded_text_ad.headline_part2,
        ad_group_ad.ad.expanded_text_ad.description,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions
      FROM ad_group_ad
      WHERE segments.date DURING LAST_30_DAYS
        AND ad_group_ad.status = 'ENABLED'
        AND campaign.advertising_channel_type = 'SEARCH'
      ORDER BY metrics.cost_micros DESC
      LIMIT 20
    `.trim();

    let top_ads = [];
    try {
      const adsRes  = await fetch(
        `${GADS_API_BASE}/customers/${cleanCustomerId}/googleAds:search`,
        {
          method:  "POST",
          headers: {
            Authorization:     `Bearer ${accessToken}`,
            "developer-token": developerToken,
            "Content-Type":    "application/json",
          },
          body: JSON.stringify({ query: adQuery }),
        }
      );
      const adsData = await adsRes.json();
      const adRows  = adsData.results || [];

      top_ads = adRows.map((row) => {
        const ad      = row.ad_group_ad?.ad || {};
        const metrics = row.metrics || {};
        const rsa     = ad.responsive_search_ad || {};
        const eta     = ad.expanded_text_ad     || {};
        const spend   = (metrics.cost_micros || 0) / 1_000_000;

        // Pull up to 3 headlines
        const headlines = rsa.headlines?.length
          ? rsa.headlines.slice(0, 3).map((h) => h.text).filter(Boolean)
          : [eta.headline_part1, eta.headline_part2].filter(Boolean);

        const descriptions = rsa.descriptions?.length
          ? rsa.descriptions.slice(0, 2).map((d) => d.text).filter(Boolean)
          : [eta.description].filter(Boolean);

        const finalUrl = (ad.final_urls || [])[0] || "";
        const domain   = finalUrl ? new URL(finalUrl).hostname.replace("www.", "") : "";

        return {
          ad_id:        ad.id,
          campaign_id:  row.campaign?.id,
          campaign_name:row.campaign?.name || "",
          type:         ad.type || "RESPONSIVE_SEARCH_AD",
          headlines,
          descriptions,
          display_url:  domain,
          final_url:    finalUrl,
          spend:        Math.round(spend),
          impressions:  parseInt(metrics.impressions || 0),
          clicks:       parseInt(metrics.clicks      || 0),
          ctr:          Math.round((parseFloat(metrics.ctr || 0)) * 10000) / 100,
          conversions:  Math.round(parseFloat(metrics.conversions || 0)),
        };
      }).filter((a) => a.headlines.length > 0);
    } catch (e) {
      console.error("[GoogleClient] top ads query failed:", e.message);
    }

    // ── Shape search terms ─────────────────────────────────────────────────
    const stRows = searchTermsData.results || [];
    const search_terms = stRows.map((row) => {
      const spend       = (row.metrics?.cost_micros || 0) / 1_000_000;
      const conversions = parseFloat(row.metrics?.conversions || 0);
      const clicks      = parseInt(row.metrics?.clicks        || 0);
      const impressions = parseInt(row.metrics?.impressions   || 0);
      const ctr         = parseFloat(row.metrics?.ctr         || 0) * 100; // convert to %
      return {
        term:         row.search_term_view?.search_term || "",
        campaign_id:  row.campaign?.id   || null,
        campaign_name:row.campaign?.name || "",
        spend:        Math.round(spend * 100) / 100,
        clicks,
        impressions,
        conversions,
        ctr:          Math.round(ctr * 100) / 100,
      };
    }).filter((t) => t.term);

    return { campaigns, top_ads, search_terms };

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
