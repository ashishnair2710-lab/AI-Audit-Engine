const { CAMPAIGN_TYPES } = require("./constants");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pct(part, total) {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100 * 10) / 10;
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount).toLocaleString("en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function categorizeCampaigns(campaigns) {
  const tofu = campaigns.filter((c) =>
    CAMPAIGN_TYPES.TOFU.includes(c.type?.toLowerCase())
  );
  const mofu = campaigns.filter((c) =>
    CAMPAIGN_TYPES.MOFU.includes(c.type?.toLowerCase())
  );
  const bofu = campaigns.filter((c) =>
    CAMPAIGN_TYPES.BOFU.includes(c.type?.toLowerCase())
  );
  return { tofu, mofu, bofu };
}

function sumField(arr, field) {
  return arr.reduce((acc, item) => acc + (item[field] || 0), 0);
}

function safeDiv(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

function issue(severity, code, message, impact, fix) {
  return { severity, code, message, impact, fix };
}

module.exports = {
  clamp,
  pct,
  formatCurrency,
  categorizeCampaigns,
  sumField,
  safeDiv,
  issue,
};
