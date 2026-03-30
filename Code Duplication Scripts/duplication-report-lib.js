const fs = require("fs");
const path = require("path");

const DUP_FILE_REGEX = /^duplicationDirectory(\d+)lines\.json$/;

function listAvailableNs(baseDir) {
  return fs
    .readdirSync(baseDir)
    .map((name) => {
      const match = name.match(DUP_FILE_REGEX);
      if (!match) return null;
      return Number(match[1]);
    })
    .filter((n) => Number.isFinite(n));
}

function readDuplicationGroups(baseDir, n) {
  const filePath = path.join(baseDir, `duplicationDirectory${n}lines.json`);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function pairKey(a, b) {
  return [a, b].sort().join(" || ");
}

function collectPairCounts(groups) {
  const pairCounts = new Map();

  for (const group of groups) {
    const files = [...new Set(group.map((entry) => entry.file))].sort();
    if (files.length < 2) {
      continue;
    }

    // Keep one canonical pair per group to remain consistent with prior thesis runs.
    const key = pairKey(files[0], files[1]);
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  }

  return pairCounts;
}

function collectFileCounts(pairCounts) {
  const fileCounts = new Map();

  for (const [pair, count] of pairCounts.entries()) {
    const [left, right] = pair.split(" || ");
    fileCounts.set(left, (fileCounts.get(left) || 0) + count);
    fileCounts.set(right, (fileCounts.get(right) || 0) + count);
  }

  return fileCounts;
}

function sortCountsDescThenName(entries) {
  return entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
}

function formatPercent(value) {
  return Number(value.toFixed(2)).toString();
}

function computeForN(baseDir, n) {
  const groups = readDuplicationGroups(baseDir, n);
  const pairCounts = collectPairCounts(groups);
  const fileCounts = collectFileCounts(pairCounts);

  const orderedPairs = sortCountsDescThenName([...pairCounts.entries()]);
  const orderedFiles = sortCountsDescThenName([...fileCounts.entries()]);

  return {
    n,
    groupsCount: groups.length,
    uniquePairCount: orderedPairs.length,
    orderedPairs,
    orderedFiles,
  };
}

module.exports = {
  listAvailableNs,
  computeForN,
  formatPercent,
};
