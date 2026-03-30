const fs = require("fs");
const path = require("path");
const { listAvailableNs, computeForN, formatPercent } = require("./duplication-report-lib");

const OUTPUT_FILE = "duplication_deep_trends.txt";
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

  const results = ns.map((n) => computeForN(baseDir, n));
  const fileTop5Presence = new Map();

  const lines = [];
  lines.push("Cross-N summary:");

  for (const result of results) {
    lines.push(`  N=${result.n} groups=${result.groupsCount} uniquePairs=${result.uniquePairCount}`);

    const top5Files = result.orderedFiles.slice(0, 5);
    for (const [file] of top5Files) {
      fileTop5Presence.set(file, (fileTop5Presence.get(file) || 0) + 1);
    }
  }

  const first = results[0];
  const last = results[results.length - 1];

  // Find the last N that still has duplication and the first N where it is gone.
  const lastNonZero = [...results].reverse().find((r) => r.groupsCount > 0);
  const firstZero = results.find((r) => r.groupsCount === 0);

  // Anchor retention to last non-zero N (anchoring to an extinct N would give 0% which is misleading).
  const retentionAnchor = lastNonZero || last;
  const groupRetention =
    first.groupsCount === 0 ? 0 : (retentionAnchor.groupsCount / first.groupsCount) * 100;
  const pairRetention =
    first.uniquePairCount === 0 ? 0 : (retentionAnchor.uniquePairCount / first.uniquePairCount) * 100;

  lines.push("");
  lines.push("Retention from smallest to largest non-zero block size:");
  lines.push(`  groups retention = ${formatPercent(groupRetention)}% (N=${first.n} -> N=${retentionAnchor.n})`);
  lines.push(`  unique-pair retention = ${formatPercent(pairRetention)}% (N=${first.n} -> N=${retentionAnchor.n})`);
  if (firstZero) {
    lines.push(`  duplication extinct at N >= ${firstZero.n} (${firstZero.n - retentionAnchor.n} line gap after last non-zero N=${retentionAnchor.n})`);
  }

  lines.push("");
  lines.push("Files recurring in top-5 hotspots across N:");

  const recurringFiles = [...fileTop5Presence.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  for (const [file, count] of recurringFiles) {
    lines.push(`  N-count=${count}  ${file}`);
  }

  fs.writeFileSync(path.join(baseDir, OUTPUT_FILE), lines.join("\n") + "\n", "utf8");
  console.log(`Generated ${OUTPUT_FILE}`);
}

main();
