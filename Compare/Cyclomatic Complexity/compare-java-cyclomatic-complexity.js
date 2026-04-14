const fs = require("fs");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_JAVA_FILES = [
  "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic_simplified.java",
  "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic.java",
  "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelODE.java",
  "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactionCenteredTables.java"
];

const CONTROL_KEYWORDS = new Set([
  "if",
  "for",
  "while",
  "switch",
  "catch",
  "do",
  "try",
  "else",
  "return",
  "throw",
  "new",
  "synchronized"
]);

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function toAbs(relPath) {
  return path.resolve(WORKSPACE_ROOT, relPath);
}

function toRepoRel(absPath) {
  return path.relative(WORKSPACE_ROOT, absPath).replace(/\\/g, "/");
}

function ensureDirectoryExists(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeSourcePreserveLayout(source) {
  let out = "";
  let i = 0;
  let state = "code";

  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];

    if (state === "code") {
      if (c === '"') {
        out += " ";
        state = "double";
        i += 1;
        continue;
      }
      if (c === "'") {
        out += " ";
        state = "single";
        i += 1;
        continue;
      }
      if (c === "/" && n === "/") {
        out += "  ";
        state = "lineComment";
        i += 2;
        continue;
      }
      if (c === "/" && n === "*") {
        out += "  ";
        state = "blockComment";
        i += 2;
        continue;
      }

      out += c;
      i += 1;
      continue;
    }

    if (state === "double") {
      if (c === "\\" && n !== undefined) {
        out += "  ";
        i += 2;
        continue;
      }
      out += c === "\n" ? "\n" : " ";
      if (c === '"') state = "code";
      i += 1;
      continue;
    }

    if (state === "single") {
      if (c === "\\" && n !== undefined) {
        out += "  ";
        i += 2;
        continue;
      }
      out += c === "\n" ? "\n" : " ";
      if (c === "'") state = "code";
      i += 1;
      continue;
    }

    if (state === "lineComment") {
      if (c === "\n") {
        out += "\n";
        state = "code";
      } else {
        out += " ";
      }
      i += 1;
      continue;
    }

    if (state === "blockComment") {
      if (c === "*" && n === "/") {
        out += "  ";
        state = "code";
        i += 2;
      } else {
        out += c === "\n" ? "\n" : " ";
        i += 1;
      }
    }
  }

  return out;
}

function stripCommentsPreserveStrings(source) {
  let out = "";
  let i = 0;
  let state = "code";

  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];

    if (state === "code") {
      if (c === '"') {
        state = "double";
        out += c;
        i += 1;
        continue;
      }
      if (c === "'") {
        state = "single";
        out += c;
        i += 1;
        continue;
      }
      if (c === "/" && n === "/") {
        state = "lineComment";
        i += 2;
        continue;
      }
      if (c === "/" && n === "*") {
        state = "blockComment";
        i += 2;
        continue;
      }

      out += c;
      i += 1;
      continue;
    }

    if (state === "double") {
      out += c;
      if (c === "\\" && n !== undefined) {
        out += n;
        i += 2;
        continue;
      }
      if (c === '"') state = "code";
      i += 1;
      continue;
    }

    if (state === "single") {
      out += c;
      if (c === "\\" && n !== undefined) {
        out += n;
        i += 2;
        continue;
      }
      if (c === "'") state = "code";
      i += 1;
      continue;
    }

    if (state === "lineComment") {
      if (c === "\n") {
        out += "\n";
        state = "code";
      }
      i += 1;
      continue;
    }

    if (state === "blockComment") {
      if (c === "\n") out += "\n";
      if (c === "*" && n === "/") {
        state = "code";
        i += 2;
      } else {
        i += 1;
      }
    }
  }

  return out;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;

  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function lineNumberAt(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

function detectClassName(source) {
  const match = source.match(/\bclass\s+([A-Za-z_$][\w$]*)/);
  return match ? match[1] : null;
}

function extractJavaUnits(source) {
  const sanitized = sanitizeSourcePreserveLayout(source);
  const className = detectClassName(source);
  const units = [];
  const methodRegex = /(?:^[ \t]*@[^\n]*\n)*^[ \t]*(?:(?:public|protected|private|static|final|synchronized|abstract|native|strictfp|default)\s+)*(?:<[^>{;()]+>\s*)?(?:[\w$\[\]<>.,?]+\s+)?([A-Za-z_$][\w$]*)\s*\([^;{}()]*\)\s*(?:throws\s+[^{]+)?\{/gm;
  let match;

  while ((match = methodRegex.exec(sanitized)) !== null) {
    const name = match[1];
    if (CONTROL_KEYWORDS.has(name)) continue;

    const openIndex = sanitized.indexOf("{", methodRegex.lastIndex - 1);
    if (openIndex === -1) continue;

    const endIndex = findMatchingBrace(sanitized, openIndex);
    if (endIndex === -1) continue;

    const header = source.slice(match.index, openIndex).trim();
    const body = source.slice(openIndex + 1, endIndex);

    units.push({
      kind: className && name === className ? "constructor" : "method",
      name,
      startLine: lineNumberAt(source, match.index),
      endLine: lineNumberAt(source, endIndex),
      body
    });

    methodRegex.lastIndex = endIndex + 1;
  }

  if (!units.length) {
    units.push({
      kind: "file",
      name: "(entire file)",
      startLine: 1,
      endLine: source.split("\n").length,
      body: sanitized
    });
  }

  return units;
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function countJavaTernaryOperators(text) {
  let count = 0;
  let state = "code";

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    const n = text[i + 1];

    if (state === "code") {
      if (c === '"') {
        state = "double";
        continue;
      }
      if (c === "'") {
        state = "single";
        continue;
      }
      if (c !== "?") continue;

      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j += 1;
      const next = text[j];

      if (next === "." || next === ":" || next === "=" || next === ">" || next === "," || next === ")") {
        continue;
      }

      const nextWordMatch = text.slice(j).match(/^([A-Za-z_$][\w$]*)/);
      if (nextWordMatch) {
        const word = nextWordMatch[1];
        if (word === "extends" || word === "super") continue;
      }

      count += 1;
      continue;
    }

    if (state === "double") {
      if (c === "\\" && n !== undefined) {
        i += 1;
        continue;
      }
      if (c === '"') state = "code";
      continue;
    }

    if (state === "single") {
      if (c === "\\" && n !== undefined) {
        i += 1;
        continue;
      }
      if (c === "'") state = "code";
    }
  }

  return count;
}

function compactBreakdown(breakdown) {
  const compact = {};

  for (const [key, value] of Object.entries(breakdown)) {
    if (value > 0) compact[key] = value;
  }

  return compact;
}

function analyzeBlock(bodyText) {
  const sanitized = sanitizeSourcePreserveLayout(bodyText);
  const commentFree = stripCommentsPreserveStrings(bodyText);

  const whileCount = countMatches(sanitized, /\bwhile\s*\(/g);
  const doWhileTailCount = countMatches(sanitized, /\}\s*while\s*\(/g);
  const standaloneWhileCount = Math.max(0, whileCount - doWhileTailCount);

  const breakdown = {
    ifStatements: countMatches(sanitized, /\bif\s*\(/g),
    forLoops: countMatches(sanitized, /\bfor\s*\(/g),
    whileLoops: standaloneWhileCount,
    doLoops: countMatches(sanitized, /\bdo\s*\{/g),
    caseBranches: countMatches(sanitized, /\bcase\b/g),
    catchBlocks: countMatches(sanitized, /\bcatch\s*\(/g),
    ternaryOperators: countJavaTernaryOperators(commentFree),
    logicalAnd: countMatches(sanitized, /&&/g),
    logicalOr: countMatches(sanitized, /\|\|/g)
  };

  const decisionPoints = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    complexity: 1 + decisionPoints,
    decisionPoints,
    breakdown: compactBreakdown(breakdown)
  };
}

function summarizeBreakdown(items) {
  const total = {};

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      total[key] = (total[key] || 0) + value;
    }
  }

  return total;
}

function analyzeJavaFile(absPath) {
  const source = normalizeNewlines(fs.readFileSync(absPath, "utf8"));
  const units = extractJavaUnits(source).map((unit) => {
    const metrics = analyzeBlock(unit.body);
    return {
      kind: unit.kind,
      name: unit.name,
      startLine: unit.startLine,
      endLine: unit.endLine,
      complexity: metrics.complexity,
      decisionPoints: metrics.decisionPoints,
      breakdown: metrics.breakdown
    };
  });

  units.sort((a, b) => {
    if (b.complexity !== a.complexity) return b.complexity - a.complexity;
    return a.name.localeCompare(b.name);
  });

  const totalComplexity = units.reduce((sum, unit) => sum + unit.complexity, 0);
  const totalDecisionPoints = units.reduce((sum, unit) => sum + unit.decisionPoints, 0);

  return {
    file: toRepoRel(absPath),
    fileName: path.basename(absPath),
    unitCount: units.length,
    totalComplexity,
    totalDecisionPoints,
    averageComplexityPerUnit: units.length ? totalComplexity / units.length : 0,
    maxUnit: units.length ? units[0] : null,
    totalsByDecision: summarizeBreakdown(units.map((unit) => unit.breakdown)),
    units
  };
}

function summarizeAnalyzedJavaFiles(analyzedFiles) {
  const sortedFiles = [...analyzedFiles].sort((a, b) => {
    if (b.totalComplexity !== a.totalComplexity) return b.totalComplexity - a.totalComplexity;
    return a.file.localeCompare(b.file);
  });

  const totalComplexity = sortedFiles.reduce((sum, file) => sum + file.totalComplexity, 0);
  const totalDecisionPoints = sortedFiles.reduce((sum, file) => sum + file.totalDecisionPoints, 0);
  const unitCount = sortedFiles.reduce((sum, file) => sum + file.unitCount, 0);

  const topUnits = [];
  for (const file of sortedFiles) {
    for (const unit of file.units) {
      topUnits.push({
        file: file.file,
        fileName: file.fileName,
        kind: unit.kind,
        name: unit.name,
        startLine: unit.startLine,
        endLine: unit.endLine,
        complexity: unit.complexity,
        decisionPoints: unit.decisionPoints,
        breakdown: unit.breakdown
      });
    }
  }

  topUnits.sort((a, b) => {
    if (b.complexity !== a.complexity) return b.complexity - a.complexity;
    if (b.decisionPoints !== a.decisionPoints) return b.decisionPoints - a.decisionPoints;
    return a.name.localeCompare(b.name);
  });

  return {
    fileCount: sortedFiles.length,
    unitCount,
    totalComplexity,
    totalDecisionPoints,
    averageComplexityPerFile: sortedFiles.length ? totalComplexity / sortedFiles.length : 0,
    averageComplexityPerUnit: unitCount ? totalComplexity / unitCount : 0,
    maxFile: sortedFiles.length ? sortedFiles[0] : null,
    maxUnit: topUnits.length ? topUnits[0] : null,
    totalsByDecision: summarizeBreakdown(sortedFiles.map((file) => file.totalsByDecision)),
    files: sortedFiles,
    topUnits: topUnits.slice(0, 20)
  };
}

function summarizeJavaFiles(targetFiles) {
  const files = targetFiles.map((relPath) => {
    const abs = toAbs(relPath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Java file not found: ${relPath}`);
    }
    return abs;
  });

  return summarizeAnalyzedJavaFiles(files.map(analyzeJavaFile));
}

function formatDecimal(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function formatBreakdown(breakdown) {
  const entries = Object.entries(breakdown || {}).filter(([, value]) => value > 0);
  if (!entries.length) return "-";
  return entries.map(([key, value]) => `${key}:${value}`).join(", ");
}

function makeMarkdown(report) {
  const lines = [];

  lines.push("# Java Cyclomatic Complexity Comparison");
  lines.push("");
  lines.push("This report was generated by `MDEThesis/Compare/Cyclomatic Complexity/compare-java-cyclomatic-complexity.js`.");
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  for (const file of report.scannedFiles) {
    lines.push(`- \`${file}\``);
  }
  lines.push("");
  lines.push("## Counting rules");
  lines.push("");
  lines.push("Base cyclomatic complexity is **1 per method or constructor**.");
  lines.push("The script adds one for Java decision constructs found outside comments and string literals:");
  lines.push("");
  lines.push("- `if`, `for`, `while`, `do`");
  lines.push("- `case` branches in `switch`");
  lines.push("- `catch` blocks");
  lines.push("- ternary `? :`");
  lines.push("- short-circuit boolean operators `&&` and `||`");
  lines.push("");
  lines.push("> Note: this is a transparent heuristic over source text, not a compiler AST metric.");
  lines.push("");
  lines.push("## Overall summary");
  lines.push("");
  lines.push(`- Files analysed: **${report.overall.fileCount}**`);
  lines.push(`- Methods/constructors analysed: **${report.overall.unitCount}**`);
  lines.push(`- Total cyclomatic complexity: **${report.overall.totalComplexity}**`);
  lines.push(`- Average complexity per executable unit: **${formatDecimal(report.overall.averageComplexityPerUnit)}**`);
  lines.push("");
  lines.push("## File overview");
  lines.push("");
  lines.push("| Java file | Methods/ctors | Total CC | Decision points | Avg/unit | Most complex unit | Unit CC |");
  lines.push("|---|---:|---:|---:|---:|---|---:|");

  for (const file of report.files) {
    lines.push(
      `| \`${file.file}\` | ${file.unitCount} | ${file.totalComplexity} | ${file.totalDecisionPoints} | ${formatDecimal(file.averageComplexityPerUnit)} | ${file.maxUnit ? `\`${file.maxUnit.name}\`` : "-"} | ${file.maxUnit ? file.maxUnit.complexity : 0} |`
    );
  }

  lines.push("");
  lines.push("## Top methods across the analysed Java classes");
  lines.push("");
  lines.push("| Rank | Method | Kind | File | Lines | CC | Decision points | Breakdown |");
  lines.push("|---:|---|---|---|---|---:|---:|---|");

  report.topUnits.forEach((unit, index) => {
    lines.push(
      `| ${index + 1} | \`${unit.name}\` | ${unit.kind} | \`${unit.file}\` | ${unit.startLine}-${unit.endLine} | ${unit.complexity} | ${unit.decisionPoints} | ${formatBreakdown(unit.breakdown)} |`
    );
  });

  lines.push("");

  for (const file of report.files) {
    lines.push(`## ${file.fileName}`);
    lines.push("");
    lines.push("| Method | Kind | Lines | CC | Breakdown |");
    lines.push("|---|---|---|---:|---|");

    for (const unit of file.units) {
      lines.push(
        `| \`${unit.name}\` | ${unit.kind} | ${unit.startLine}-${unit.endLine} | ${unit.complexity} | ${formatBreakdown(unit.breakdown)} |`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

function buildReport(targetFiles) {
  const summary = summarizeJavaFiles(targetFiles);

  return {
    generatedAt: new Date().toISOString(),
    script: "MDEThesis/Compare/Cyclomatic Complexity/compare-java-cyclomatic-complexity.js",
    scannedFiles: targetFiles,
    notes: [
      "Heuristic Java cyclomatic complexity for the ANIMO generator classes used in the compare chapter.",
      "Counts ignore comments and string literals so generated UPPAAL/XML text inside append calls is not treated as Java control flow.",
      "Base complexity is 1 per method or constructor."
    ],
    overall: {
      fileCount: summary.fileCount,
      unitCount: summary.unitCount,
      totalComplexity: summary.totalComplexity,
      totalDecisionPoints: summary.totalDecisionPoints,
      averageComplexityPerFile: summary.averageComplexityPerFile,
      averageComplexityPerUnit: summary.averageComplexityPerUnit,
      maxFile: summary.maxFile,
      maxUnit: summary.maxUnit,
      totalsByDecision: summary.totalsByDecision
    },
    files: summary.files,
    topUnits: summary.topUnits
  };
}

function main() {
  const cliFiles = process.argv.slice(2);
  const targetFiles = cliFiles.length ? cliFiles : DEFAULT_JAVA_FILES;
  const report = buildReport(targetFiles);

  const outputDir = path.join(__dirname, "compare-results");
  ensureDirectoryExists(outputDir);

  const jsonPath = path.join(outputDir, "compare_java_cyclomatic_complexity.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdPath = path.join(outputDir, "compare_java_cyclomatic_complexity.md");
  fs.writeFileSync(mdPath, makeMarkdown(report), "utf8");

  console.log(`Analysed ${report.overall.fileCount} Java files`);
  console.log(
    `overall: units=${report.overall.unitCount}, totalCC=${report.overall.totalComplexity}, avgPerUnit=${formatDecimal(report.overall.averageComplexityPerUnit)}`
  );
  for (const file of report.files) {
    console.log(
      `${path.basename(file.file)}: units=${file.unitCount}, totalCC=${file.totalComplexity}, avgPerUnit=${formatDecimal(file.averageComplexityPerUnit)}`
    );
  }
  console.log(`Wrote ${toRepoRel(jsonPath)}`);
  console.log(`Wrote ${toRepoRel(mdPath)}`);
}

module.exports = {
  WORKSPACE_ROOT,
  DEFAULT_JAVA_FILES,
  toAbs,
  toRepoRel,
  normalizeNewlines,
  sanitizeSourcePreserveLayout,
  stripCommentsPreserveStrings,
  formatDecimal,
  formatBreakdown,
  analyzeBlock,
  analyzeJavaFile,
  summarizeJavaFiles,
  buildReport
};

if (require.main === module) {
  main();
}
