const fs = require("fs");
const path = require("path");
const { listAvailableNs, computeForN, formatPercent } = require("./duplication-report-lib");

const OUTPUT_FILE = "duplication_trends.txt";
const ANALYSIS_NS = [10, 52, 60, 75, 103, 108, 119, 120, 125, 150, 200, 250, 300, 400, 500, 716, 717];

function resolveAnalysisNs(baseDir) {
  const available = new Set(listAvailableNs(baseDir));
  return ANALYSIS_NS.filter((n) => available.has(n));
}

function main() {
  const baseDir = __dirname;
  const ns = resolveAnalysisNs(baseDir);

  if (ns.length === 0) {
    throw new Error("No duplicationDirectory<N>lines.json files found.");
  }

  const pairTop5Presence = new Map();
  const lines = [];

  for (const n of ns) {
    const result = computeForN(baseDir, n);
    const top5Pairs = result.orderedPairs.slice(0, 5);
    const top5PairSum = top5Pairs.reduce((sum, [, count]) => sum + count, 0);
    const top5Share = result.groupsCount === 0 ? 0 : (top5PairSum / result.groupsCount) * 100;

    lines.push(`N=${n} groups=${result.groupsCount} top5PairShare=${formatPercent(top5Share)}%`);

    for (const [pair] of top5Pairs) {
      pairTop5Presence.set(pair, (pairTop5Presence.get(pair) || 0) + 1);
    }
  }

  lines.push("");
  lines.push("Pairs recurring in top-5 across multiple N:");

  const recurringPairs = [...pairTop5Presence.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  for (const [pair, count] of recurringPairs) {
    lines.push(`  N-count=${count}  ${pair}`);
  }

  fs.writeFileSync(path.join(baseDir, OUTPUT_FILE), lines.join("\n") + "\n", "utf8");
  console.log(`Generated ${OUTPUT_FILE}`);
}

main();
