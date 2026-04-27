/**
 * Local test runner — no server needed.
 * Run: node tests/runMockAudit.js
 */

const { mockAuditPayload }       = require("../data/mockData");
const { analyzeMeta }            = require("../lib/analyzers/analyzeMeta");
const { analyzeGoogle }          = require("../lib/analyzers/analyzeGoogle");
const { analyzeCompetitors }     = require("../lib/analyzers/analyzeCompetitors");
const { generateCrossInsights }  = require("../lib/analyzers/generateCrossInsights");
const { calculateScore }         = require("../lib/analyzers/calculateScore");
const { generateReport }         = require("../lib/analyzers/generateReport");

function separator(title) {
  console.log("\n" + "─".repeat(60));
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

function run() {
  console.log("\n🚀  AI Full Funnel Audit Engine — Test Run");
  console.log("    Using: UAE e-commerce mock data\n");

  const { meta_data, google_data, competitor_data } = mockAuditPayload;

  separator("1. META AUDIT");
  const metaResult = analyzeMeta(meta_data);
  console.log(`  Funnel: TOFU=${metaResult.funnel_presence.tofu} | MOFU=${metaResult.funnel_presence.mofu} | BOFU=${metaResult.funnel_presence.bofu}`);
  console.log(`  Budget: TOFU ${metaResult.budget_split.tofu_pct}% | MOFU ${metaResult.budget_split.mofu_pct}% | BOFU ${metaResult.budget_split.bofu_pct}%`);
  console.log(`  Signal: Pixel=${metaResult.signal_quality.pixel_active} | CAPI=${metaResult.signal_quality.capi_enabled}`);
  console.log(`  Creatives: ${metaResult.creative_system.total_creatives} | Video: ${metaResult.creative_system.has_video}`);
  console.log(`  Retargeting campaigns: ${metaResult.audience_mix.retargeting}`);
  console.log(`\n  Issues (${metaResult.issues.length}):`);
  metaResult.issues.forEach((i) => console.log(`    [${i.severity}] ${i.message}`));

  separator("2. GOOGLE AUDIT");
  const googleResult = analyzeGoogle(google_data);
  console.log(`  Total spend: AED ${googleResult.summary.total_spend.toLocaleString()}`);
  console.log(`  Avg ROAS: ${googleResult.summary.avg_roas}x`);
  console.log(`  Wasted spend: AED ${googleResult.summary.wasted_spend.toLocaleString()} across ${googleResult.summary.wasted_campaigns} campaign(s)`);
  console.log(`\n  Issues (${googleResult.issues.length}):`);
  googleResult.issues.forEach((i) => console.log(`    [${i.severity}] ${i.message}`));

  separator("3. COMPETITOR ANALYSIS");
  const competitorResult = analyzeCompetitors(competitor_data, meta_data);
  console.log(`  Competitors analysed: ${competitorResult.benchmarks.competitors_analyzed}`);
  console.log(`  Your creatives: ${competitorResult.benchmarks.user_creative_count} | Avg competitor: ${competitorResult.benchmarks.avg_competitor_creative_count}`);
  console.log(`  Winning ads detected: ${competitorResult.winning_ads.length}`);
  competitorResult.winning_ads.forEach((w) => console.log(`    → ${w.brand}: ${w.duration_days}d running`));
  console.log(`\n  Issues (${competitorResult.issues.length}):`);
  competitorResult.issues.forEach((i) => console.log(`    [${i.severity}] ${i.message}`));

  separator("4. CROSS-PLATFORM INSIGHTS");
  const crossInsights = generateCrossInsights(metaResult, googleResult);
  crossInsights.forEach((ci) => {
    console.log(`  [${ci.severity}] ${ci.title}`);
    console.log(`    Impact: ${ci.impact}`);
  });

  separator("5. SCORE");
  const scoreResult = calculateScore(metaResult, googleResult, competitorResult);
  console.log(`  TOTAL SCORE: ${scoreResult.total}/100  Grade: ${scoreResult.grade}  (${scoreResult.label})`);
  Object.entries(scoreResult.breakdown).forEach(([dim, val]) => {
    const bar = "█".repeat(Math.round(val.score / 25 * 10)) + "░".repeat(10 - Math.round(val.score / 25 * 10));
    console.log(`  ${dim.padEnd(14)} [${bar}] ${val.score}/${val.max}  — ${val.notes}`);
  });

  separator("6. FINAL REPORT — TOP FIXES");
  const report = generateReport(metaResult, googleResult, competitorResult, crossInsights, scoreResult);
  report.top_fixes.forEach((fix, i) => {
    console.log(`  ${i + 1}. [${fix.severity}] ${fix.title}`);
    console.log(`     → ${fix.action}\n`);
  });

  separator("7. GROWTH OPPORTUNITIES");
  report.growth_opportunities.forEach((opp, i) => {
    console.log(`  ${i + 1}. ${opp.title}  (${opp.timeline})`);
    console.log(`     Impact: ${opp.impact}`);
  });

  separator("8. AI SUMMARY");
  const words = report.summary.split(" ");
  for (let i = 0; i < words.length; i += 12) {
    console.log("  " + words.slice(i, i + 12).join(" "));
  }

  console.log("\n" + "═".repeat(60));
  console.log(`  ✅  Audit complete. Score: ${report.funnel_health_score}/100`);
  console.log(`  Total issues: ${report.kpis.total_issues} (${report.kpis.critical_issues} critical, ${report.kpis.high_issues} high)`);
  console.log(`  Wasted spend identified: ${report.kpis.wasted_spend_formatted}`);
  console.log("═".repeat(60) + "\n");
}

run();
