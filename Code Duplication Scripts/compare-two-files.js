#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function readLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/);
}

function buildLcsTable(a, b) {
  const rows = a.length;
  const cols = b.length;
  const table = Array.from({ length: rows + 1 }, () => new Uint32Array(cols + 1));

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        table[i][j] = table[i + 1][j + 1] + 1;
      } else {
        table[i][j] = Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
  }

  return table;
}

function buildDiffOperations(a, b, lcsTable) {
  const ops = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", lineA: i + 1, lineB: j + 1, text: a[i] });
      i++;
      j++;
    } else if (lcsTable[i + 1][j] >= lcsTable[i][j + 1]) {
      ops.push({ type: "remove", lineA: i + 1, lineB: null, text: a[i] });
      i++;
    } else {
      ops.push({ type: "add", lineA: null, lineB: j + 1, text: b[j] });
      j++;
    }
  }

  while (i < a.length) {
    ops.push({ type: "remove", lineA: i + 1, lineB: null, text: a[i] });
    i++;
  }

  while (j < b.length) {
    ops.push({ type: "add", lineA: null, lineB: j + 1, text: b[j] });
    j++;
  }

  return ops;
}

function hunkHeader(startA, lenA, startB, lenB) {
  return `@@ -${startA},${lenA} +${startB},${lenB} @@`;
}

function formatDiffReport(fileA, fileB, ops) {
  const lines = [];
  const now = new Date().toISOString();

  let equalCount = 0;
  let addCount = 0;
  let removeCount = 0;

  for (const op of ops) {
    if (op.type === "equal") equalCount++;
    if (op.type === "add") addCount++;
    if (op.type === "remove") removeCount++;
  }

  lines.push("Line-based Diff Report");
  lines.push(`Generated: ${now}`);
  lines.push(`Original: ${fileA}`);
  lines.push(`Compared: ${fileB}`);
  lines.push("");
  lines.push("Summary");
  lines.push(`Equal lines : ${equalCount}`);
  lines.push(`Added lines : ${addCount}`);
  lines.push(`Removed lines: ${removeCount}`);
  lines.push("");
  lines.push("Details");

  const context = 2;
  const blocks = [];
  let idx = 0;

  while (idx < ops.length) {
    if (ops[idx].type === "equal") {
      idx++;
      continue;
    }

    const blockStart = Math.max(0, idx - context);
    let blockEnd = idx;

    while (blockEnd < ops.length) {
      if (ops[blockEnd].type !== "equal") {
        blockEnd++;
        continue;
      }

      let lookahead = blockEnd;
      let equalRun = 0;
      while (lookahead < ops.length && ops[lookahead].type === "equal") {
        equalRun++;
        lookahead++;
      }

      if (equalRun > context) {
        blockEnd += context;
        break;
      }

      blockEnd = lookahead;
    }

    if (blockEnd >= ops.length) {
      blockEnd = ops.length;
    }

    blocks.push([blockStart, blockEnd]);
    idx = blockEnd;
  }

  if (blocks.length === 0) {
    lines.push("No differences found.");
    return lines.join("\n");
  }

  for (const [start, end] of blocks) {
    const slice = ops.slice(start, end);

    let startA = 1;
    let startB = 1;
    for (let i = start; i < end; i++) {
      if (ops[i].lineA !== null) {
        startA = ops[i].lineA;
        break;
      }
    }
    for (let i = start; i < end; i++) {
      if (ops[i].lineB !== null) {
        startB = ops[i].lineB;
        break;
      }
    }

    const lenA = slice.filter((x) => x.lineA !== null).length;
    const lenB = slice.filter((x) => x.lineB !== null).length;

    lines.push("");
    lines.push(hunkHeader(startA, lenA, startB, lenB));

    for (const op of slice) {
      if (op.type === "equal") {
        lines.push(`  [A:${op.lineA}|B:${op.lineB}] ${op.text}`);
      } else if (op.type === "remove") {
        lines.push(`- [A:${op.lineA}] ${op.text}`);
      } else {
        lines.push(`+ [B:${op.lineB}] ${op.text}`);
      }
    }
  }

  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: node compare-two-files.js <fileA> <fileB> <outputFile>");
    process.exit(1);
  }

  const [fileA, fileB, outputFile] = args;
  const absA = path.resolve(fileA);
  const absB = path.resolve(fileB);
  const absOut = path.resolve(outputFile);

  if (!fs.existsSync(absA)) {
    console.error(`File not found: ${absA}`);
    process.exit(2);
  }
  if (!fs.existsSync(absB)) {
    console.error(`File not found: ${absB}`);
    process.exit(3);
  }

  const linesA = readLines(absA);
  const linesB = readLines(absB);

  const table = buildLcsTable(linesA, linesB);
  const ops = buildDiffOperations(linesA, linesB, table);
  const report = formatDiffReport(absA, absB, ops);

  fs.writeFileSync(absOut, report, "utf8");
  console.log(`Diff written to: ${absOut}`);
}

main();
