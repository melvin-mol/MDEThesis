const fs = require("fs");
const path = require("path");
const { listAvailableNs, computeForN } = require("./duplication-report-lib");

const OUTPUT_FILE = "duplication_summary_full.txt";
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

  const lines = [];

  for (const n of ns) {
    const result = computeForN(baseDir, n);

    lines.push(`N=${n} Groups=${result.groupsCount} UniquePairs=${result.uniquePairCount}`);
    lines.push("Top pairs:");
    for (const [pair, count] of result.orderedPairs.slice(0, 5)) {
      lines.push(`  ${count}x ${pair}`);
    }

    lines.push("Top files:");
    for (const [file, count] of result.orderedFiles.slice(0, 5)) {
      lines.push(`  ${count}x ${file}`);
    }

    lines.push("");
  }

  fs.writeFileSync(path.join(baseDir, OUTPUT_FILE), lines.join("\n").trimEnd() + "\n", "utf8");
  console.log(`Generated ${OUTPUT_FILE}`);
}

main();
