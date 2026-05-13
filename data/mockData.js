/**
 * Realistic mock data for a UAE-based e-commerce brand.
 * Deliberately has several issues for the audit engine to catch.
 * Currency: AED
 */
const mockAuditPayload = {
  meta_data: {
    campaigns: [
      // TOFU — underfunded, no CAPI
      {
        type:            "awareness",
        spend:           2100,
        impressions:     320000,
        clicks:          2900,
        ctr:             0.91,
        conversions:     0,
        creatives_count: 2,
        creative_types:  ["image"],
        audience_type:   "broad",
        pixel_active:    true,
        capi_enabled:    false, // ← HIGH issue
      },
      // MOFU — missing entirely (no mofu campaign)
      // BOFU — conversion campaign, small creative count
      {
        type:            "conversion",
        spend:           8400,
        impressions:     95000,
        clicks:          3100,
        ctr:             3.26,
        conversions:     41,
        creatives_count: 2, // ← below threshold
        creative_types:  ["image"],
        audience_type:   "interest",
        pixel_active:    true,
        capi_enabled:    false,
      },
      // BOFU retargeting — absent (audience_type not retargeting)
      {
        type:            "conversion",
        spend:           3200,
        impressions:     42000,
        clicks:          1840,
        ctr:             4.38,
        conversions:     28,
        creatives_count: 1,
        creative_types:  ["image"],
        audience_type:   "interest", // ← no retargeting
        pixel_active:    true,
        capi_enabled:    false,
      },
    ],
  },

  google_data: {
    campaigns: [
      // Branded search — performing well
      {
        type:               "search",
        spend:              4200,
        roas:               4.8,
        conversions:        62,
        keywords:           ['"[brand name]"', '"[brand] online"', '"buy [brand]"'],
        product_titles:     [],
        feed_quality_score: null,
      },
      // Non-branded search — wasted spend
      {
        type:               "search",
        spend:              6800,
        roas:               0.7, // ← ROAS < 1 = wasted
        conversions:        8,
        keywords:           ["online store", "buy online", "best deals", "cheap products"], // broad, low intent
        product_titles:     [],
        feed_quality_score: null,
      },
      // Shopping — poor feed quality
      {
        type:               "shopping",
        spend:              5500,
        roas:               1.9,
        conversions:        19,
        keywords:           [],
        product_titles:     ["Bag", "Shoes", "Hat", "Watch"], // ← too short
        feed_quality_score: 54, // ← below 70 threshold
      },
    ],
  },

  competitor_data: [
    {
      brand:        "CompetitorA",
      ad_count:     38,
      formats:      ["video", "image", "carousel"],
      hooks:        [
        "Free delivery on all orders",
        "Limited time — 30% off",
        "Trusted by 50,000 customers",
        "Fast shipping guaranteed",
      ],
      duration_days: 45,
      ads: [
        { id: "1", page_name: "CompetitorA", title: "Free delivery on all orders", body: "Shop now and get free shipping on every order over AED 150.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "2", page_name: "CompetitorA", title: "Limited time — 30% off",      body: "Huge savings this week only. Don't miss out.",               image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "3", page_name: "CompetitorA", title: "Trusted by 50,000 customers", body: "Join thousands of happy customers across the UAE.",           image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
      ],
    },
    {
      brand:        "CompetitorB",
      ad_count:     14,
      formats:      ["video", "image"],
      hooks:        [
        "Exclusive deals — shop now",
        "Quality you can trust",
        "Easy returns",
      ],
      duration_days: 18,
      ads: [
        { id: "4", page_name: "CompetitorB", title: "Exclusive deals — shop now", body: "Hand-picked offers, refreshed daily.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "5", page_name: "CompetitorB", title: "Easy 30-day returns",        body: "Not happy? Send it back. No questions asked.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
      ],
    },
    {
      brand:        "CompetitorC",
      ad_count:     22,
      formats:      ["image", "carousel"],
      hooks:        [
        "New arrivals weekly",
        "Best price guaranteed",
      ],
      duration_days: 60,
      ads: [
        { id: "6", page_name: "CompetitorC", title: "New arrivals every week", body: "Fresh styles added every Monday. Be first.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "7", page_name: "CompetitorC", title: "Best price guaranteed",   body: "Found it cheaper? We'll match it.",         image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
      ],
    },
  ],
};

module.exports = { mockAuditPayload };
