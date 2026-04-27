// Thresholds that drive all audit logic — edit here to tune sensitivity
const THRESHOLDS = {
  meta: {
    minCreatives: 3,
    minTofuBudgetPct: 30,         // % of total Meta spend that should be awareness
    maxBofuBudgetPct: 70,         // warn if bottom-funnel dominates
    lowCtrPct: 1.0,               // CTR below this is underperforming
    highCpmThreshold: 80,         // AED — high CPM warning
  },
  google: {
    minRoas: 1.0,                 // below this = wasted spend
    minFeedQualityScore: 70,      // Shopping feed health
    highCpaMultiplier: 3,         // CPA > 3× average triggers cross-insight
    lowConversionRateThreshold: 1, // % — search conversion rate floor
  },
  competitor: {
    creativeVolumeMultiplier: 2,  // flag if competitor runs 2× your creatives
    winningAdDays: 30,            // ads running > 30 days are likely winners
  },
  scoring: {
    funnelCompletenessWeight: 25,
    efficiencyWeight: 25,
    signalStrengthWeight: 25,
    competitiveStrengthWeight: 25,
  },
};

const CAMPAIGN_TYPES = {
  TOFU: ["awareness"],
  MOFU: ["traffic", "engagement"],
  BOFU: ["conversion", "retargeting"],
};

const SEVERITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

module.exports = { THRESHOLDS, CAMPAIGN_TYPES, SEVERITY };
