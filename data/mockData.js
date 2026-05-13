/**
 * Realistic mock data for a UAE-based e-commerce brand.
 * Deliberately has several issues for the audit engine to catch.
 * Currency: AED
 */
const mockAuditPayload = {
  meta_data: {
    campaigns: [
      // TOFU — awareness, underfunded, no CAPI
      {
        name:             "Chivas | Awareness | Broad",
        type:             "awareness",
        spend:            2100,
        impressions:      320000,
        clicks:           2900,
        ctr:              0.91,
        cpm:              6.56,
        conversions:      0,
        conversion_value: 0,
        creatives_count:  2,
        creative_types:   ["image"],
        audience_type:    "broad",
        pixel_active:     true,
        capi_enabled:     false,
      },
      // BOFU — conversion campaign, low creative count
      {
        name:             "Chivas | Purchase | Interest",
        type:             "conversion",
        spend:            8400,
        impressions:      95000,
        clicks:           3100,
        ctr:              3.26,
        cpm:              88.42,
        conversions:      41,
        conversion_value: 28700,
        creatives_count:  2,
        creative_types:   ["image"],
        audience_type:    "interest",
        pixel_active:     true,
        capi_enabled:     false,
      },
      // BOFU — interest (no retargeting)
      {
        name:             "Chivas | Purchase | Lookalike",
        type:             "conversion",
        spend:            3200,
        impressions:      42000,
        clicks:           1840,
        ctr:              4.38,
        cpm:              76.19,
        conversions:      28,
        conversion_value: 19600,
        creatives_count:  1,
        creative_types:   ["image"],
        audience_type:    "interest",
        pixel_active:     true,
        capi_enabled:     false,
      },
    ],
  },

  google_data: {
    campaigns: [
      // Branded search — performing well
      {
        name:             "Chivas | Brand Search",
        type:             "search",
        spend:            4200,
        impressions:      38000,
        clicks:           2940,
        roas:             4.8,
        conversions:      62,
        conversion_value: 20160,
        keywords:         ['"[brand name]"', '"[brand] online"', '"buy [brand]"'],
        product_titles:   [],
        feed_quality_score: null,
      },
      // Non-branded — wasted spend (broad match, low ROAS)
      {
        name:             "Chivas | Generic Search",
        type:             "search",
        spend:            6800,
        impressions:      210000,
        clicks:           4200,
        roas:             0.7,
        conversions:      8,
        conversion_value: 4760,
        keywords:         ["online store", "buy online", "best deals", "cheap products"],
        product_titles:   [],
        feed_quality_score: null,
      },
      // Shopping — poor feed quality
      {
        name:             "Chivas | Shopping",
        type:             "shopping",
        spend:            5500,
        impressions:      92000,
        clicks:           1840,
        roas:             1.9,
        conversions:      19,
        conversion_value: 10450,
        keywords:         [],
        product_titles:   ["Bag", "Shoes", "Hat", "Watch"],
        feed_quality_score: 54,
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
