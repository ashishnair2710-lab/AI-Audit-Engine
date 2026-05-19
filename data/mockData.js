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

    // Top RSA ad creatives (used for Google Ads preview panel)
    top_ads: [
      {
        ad_id:         "ad_001",
        campaign_id:   "camp_001",
        campaign_name: "Chivas | Brand Search",
        type:          "RESPONSIVE_SEARCH_AD",
        headlines:     ["Buy Chivas Regal Online", "Official UAE Store", "Free Delivery Over AED 200"],
        descriptions:  ["Shop the full Chivas range. Premium Scotch whisky delivered to your door across the UAE.", "Exclusive bundles and gift sets available. Order by 3pm for same-day dispatch."],
        display_url:   "chivasregal.com",
        final_url:     "https://www.chivasregal.com/en-ae/shop",
        spend:         2840,
        impressions:   18400,
        clicks:        1620,
        ctr:           8.8,
        conversions:   42,
      },
      {
        ad_id:         "ad_002",
        campaign_id:   "camp_001",
        campaign_name: "Chivas | Brand Search",
        type:          "RESPONSIVE_SEARCH_AD",
        headlines:     ["Chivas 12 Year Old Whisky", "AED 189 | Free Shipping", "Gift Wrapping Available"],
        descriptions:  ["The original blend. Rich, smooth and complex. Order online with secure checkout.", "Perfect for gifts. Add a personalised message at checkout."],
        display_url:   "chivasregal.com/shop",
        final_url:     "https://www.chivasregal.com/en-ae/shop/chivas-12",
        spend:         1360,
        impressions:   9200,
        clicks:        740,
        ctr:           8.04,
        conversions:   20,
      },
      {
        ad_id:         "ad_003",
        campaign_id:   "camp_002",
        campaign_name: "Chivas | Generic Search",
        type:          "RESPONSIVE_SEARCH_AD",
        headlines:     ["Premium Whisky Online UAE", "Best Price Guaranteed", "Shop Scotch Whisky"],
        descriptions:  ["Browse a wide selection of premium Scotch whiskies. Fast delivery across UAE.", "Compare prices and find the best deals on top whisky brands."],
        display_url:   "chivasregal.com",
        final_url:     "https://www.chivasregal.com/en-ae",
        spend:         3100,
        impressions:   84000,
        clicks:        1050,
        ctr:           1.25,
        conversions:   4,
      },
      {
        ad_id:         "ad_004",
        campaign_id:   "camp_002",
        campaign_name: "Chivas | Generic Search",
        type:          "RESPONSIVE_SEARCH_AD",
        headlines:     ["Buy Alcohol Online Dubai", "Same Day Delivery", "Licensed UAE Retailer"],
        descriptions:  ["Order spirits, wines and beers online. Fast and discreet delivery in Dubai.", "Over 2000 products in stock. Licensed delivery to your door."],
        display_url:   "chivasregal.com/uae",
        final_url:     "https://www.chivasregal.com/en-ae",
        spend:         1680,
        impressions:   62000,
        clicks:        490,
        ctr:           0.79,
        conversions:   2,
      },
    ],

    // Actual search terms that triggered ads (search_term_view)
    search_terms: [
      // Irrelevant — spend with zero conversions + low CTR
      { term: "cheap alcohol uae",           campaign_name: "Chivas | Generic Search", spend: 420,  clicks: 18,  impressions: 6800,  conversions: 0, ctr: 0.26 },
      { term: "free alcohol delivery dubai", campaign_name: "Chivas | Generic Search", spend: 380,  clicks: 12,  impressions: 8200,  conversions: 0, ctr: 0.15 },
      { term: "wine shop near me",           campaign_name: "Chivas | Generic Search", spend: 310,  clicks: 22,  impressions: 5100,  conversions: 0, ctr: 0.43 },
      { term: "vodka price in dubai",        campaign_name: "Chivas | Generic Search", spend: 290,  clicks: 9,   impressions: 7400,  conversions: 0, ctr: 0.12 },
      { term: "beer delivery abu dhabi",     campaign_name: "Chivas | Generic Search", spend: 260,  clicks: 14,  impressions: 4900,  conversions: 0, ctr: 0.29 },
      { term: "rum cocktails recipes",       campaign_name: "Chivas | Generic Search", spend: 180,  clicks: 31,  impressions: 11000, conversions: 0, ctr: 0.28 },
      { term: "liquor store sharjah",        campaign_name: "Chivas | Generic Search", spend: 155,  clicks: 7,   impressions: 3200,  conversions: 0, ctr: 0.22 },
      { term: "alcohol gift hamper uae",     campaign_name: "Chivas | Generic Search", spend: 140,  clicks: 19,  impressions: 4600,  conversions: 0, ctr: 0.41 },
      // Relevant — converting terms (not flagged)
      { term: "chivas regal 12 buy online",  campaign_name: "Chivas | Brand Search",   spend: 680,  clicks: 420, impressions: 4900,  conversions: 18, ctr: 8.57 },
      { term: "chivas regal uae",            campaign_name: "Chivas | Brand Search",   spend: 540,  clicks: 310, impressions: 3800,  conversions: 14, ctr: 8.16 },
      { term: "chivas 18 price dubai",       campaign_name: "Chivas | Brand Search",   spend: 320,  clicks: 180, impressions: 2100,  conversions: 8,  ctr: 8.57 },
      { term: "buy scotch whisky dubai",     campaign_name: "Chivas | Generic Search", spend: 290,  clicks: 62,  impressions: 2800,  conversions: 3,  ctr: 2.21 },
    ],
  },

  competitor_data: [
    {
      brand:        "CompetitorA",
      ad_count:     38,
      formats:      ["video", "image", "carousel"],
      hooks:        [
        "Free delivery on all orders",
        "Limited time. 30% off",
        "Trusted by 50,000 customers",
        "Fast shipping guaranteed",
      ],
      duration_days: 45,
      ads: [
        { id: "1", page_name: "CompetitorA", title: "Free delivery on all orders", body: "Shop now and get free shipping on every order over AED 150.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "2", page_name: "CompetitorA", title: "Limited time. 30% off",      body: "Huge savings this week only. Don't miss out.",               image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
        { id: "3", page_name: "CompetitorA", title: "Trusted by 50,000 customers", body: "Join thousands of happy customers across the UAE.",           image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
      ],
    },
    {
      brand:        "CompetitorB",
      ad_count:     14,
      formats:      ["video", "image"],
      hooks:        [
        "Exclusive deals. Shop now",
        "Quality you can trust",
        "Easy returns",
      ],
      duration_days: 18,
      ads: [
        { id: "4", page_name: "CompetitorB", title: "Exclusive deals. Shop now", body: "Hand-picked offers, refreshed daily.", image_url: "", snapshot_url: "https://www.facebook.com/ads/library/" },
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
