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

    units.push({
      kind: className && name === className ? "constructor" : "method",
      name,
      startLine: lineNumberAt(source, match.index),
      endLine: lineNumberAt(source, endIndex),
      body: source.slice(openIndex + 1, endIndex)
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

function countPositions(text, regex) {
  const matches = [];
  const copy = new RegExp(regex.source, regex.flags);
  let match;

  while ((match = copy.exec(text)) !== null) {
    matches.push(match.index);
    if (copy.lastIndex === match.index) copy.lastIndex += 1;
  }

  return matches;
}

function countJavaTernaryPositions(text) {
  const positions = [];
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

      positions.push(i);
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

  return positions;
}

function makeBraceDepthMap(text) {
  const depthMap = new Array(text.length).fill(0);
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    depthMap[i] = depth;
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") depth = Math.max(0, depth - 1);
  }

  return depthMap;
}

function scorePositions(positions, depthMap, nested) {
  let total = 0;
  for (const position of positions) {
    total += nested ? 1 + Math.max(0, depthMap[position] || 0) : 1;
  }
  return total;
}

function compactBreakdown(breakdown) {
  const compact = {};
  for (const [key, value] of Object.entries(breakdown)) {
    if (value > 0) compact[key] = value;
  }
  return compact;
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

function analyzeBlock(bodyText) {
  const sanitized = sanitizeSourcePreserveLayout(bodyText);
  const commentFree = stripCommentsPreserveStrings(bodyText);
  const depthMap = makeBraceDepthMap(sanitized);

  const breakdown = {
    ifStatements: scorePositions(countPositions(sanitized, /\bif\s*\(/g), depthMap, true),
    forLoops: scorePositions(countPositions(sanitized, /\bfor\s*\(/g), depthMap, true),
    whileLoops: scorePositions(countPositions(sanitized, /\bwhile\s*\(/g), depthMap, true),
    doLoops: scorePositions(countPositions(sanitized, /\bdo\s*\{/g), depthMap, true),
    switchStatements: scorePositions(countPositions(sanitized, /\bswitch\s*\(/g), depthMap, true),
    catchBlocks: scorePositions(countPositions(sanitized, /\bcatch\s*\(/g), depthMap, true),
    ternaryOperators: scorePositions(countJavaTernaryPositions(commentFree), depthMap, true),
    logicalAnd: countPositions(sanitized, /&&/g).length,
    logicalOr: countPositions(sanitized, /\|\|/g).length,
    breakStatements: countPositions(sanitized, /\bbreak\b/g).length,
    continueStatements: countPositions(sanitized, /\bcontinue\b/g).length,
    throwStatements: countPositions(sanitized, /\bthrow\b/g).length
  };

  const cognitiveComplexity = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    cognitiveComplexity,
    breakdown: compactBreakdown(breakdown)
  };
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
      cognitiveComplexity: metrics.cognitiveComplexity,
      breakdown: metrics.breakdown
    };
  });

  units.sort((a, b) => {
    if (b.cognitiveComplexity !== a.cognitiveComplexity) return b.cognitiveComplexity - a.cognitiveComplexity;
    return a.name.localeCompare(b.name);
  });

  const totalCognitiveComplexity = units.reduce((sum, unit) => sum + unit.cognitiveComplexity, 0);

  return {
    file: toRepoRel(absPath),
    fileName: path.basename(absPath),
    unitCount: units.length,
    totalCognitiveComplexity,
    averageCognitivePerUnit: units.length ? totalCognitiveComplexity / units.length : 0,
    maxUnit: units.length ? units[0] : null,
    totalsByDecision: summarizeBreakdown(units.map((unit) => unit.breakdown)),
    units
  };
}

function summarizeAnalyzedJavaFiles(analyzedFiles) {
  const sortedFiles = [...analyzedFiles].sort((a, b) => {
    if (b.totalCognitiveComplexity !== a.totalCognitiveComplexity) return b.totalCognitiveComplexity - a.totalCognitiveComplexity;
    return a.file.localeCompare(b.file);
  });

  const totalCognitiveComplexity = sortedFiles.reduce((sum, file) => sum + file.totalCognitiveComplexity, 0);
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
        cognitiveComplexity: unit.cognitiveComplexity,
        breakdown: unit.breakdown
      });
    }
  }

  topUnits.sort((a, b) => {
    if (b.cognitiveComplexity !== a.cognitiveComplexity) return b.cognitiveComplexity - a.cognitiveComplexity;
    return a.name.localeCompare(b.name);
  });

  return {
    fileCount: sortedFiles.length,
    unitCount,
    totalCognitiveComplexity,
    averageCognitivePerFile: sortedFiles.length ? totalCognitiveComplexity / sortedFiles.length : 0,
    averageCognitivePerUnit: unitCount ? totalCognitiveComplexity / unitCount : 0,
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

  lines.push("# Java Cognitive Complexity Comparison");
  lines.push("");
  lines.push("This report was generated by `MDEThesis/Compare/Cognitive Complexity/compare-java-cognitive-complexity.js`.");
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  for (const file of report.scannedFiles) {
    lines.push(`- \`${file}\``);
  }
  lines.push("");
  lines.push("## Counting rules");
  lines.push("");
  lines.push("This report uses a transparent source-based heuristic for **cognitive complexity**.");
  lines.push("It follows the general idea that control-flow breaks increase mental load, and nested control-flow breaks increase it further.");
  lines.push("");
  lines.push("The Java script counts the following constructs outside comments and string literals:");
  lines.push("");
  lines.push("- `if`, `for`, `while`, `do`, `switch`, `catch`");
  lines.push("- ternary `? :`");
  lines.push("- short-circuit boolean operators `&&` and `||`");
  lines.push("- `break`, `continue`, and `throw`");
  lines.push("");
  lines.push("> Nested control structures receive an extra penalty based on their current brace nesting depth. This is a documented heuristic for the thesis comparison, not a compiler AST metric.");
  lines.push("");
  lines.push("## Overall summary");
  lines.push("");
  lines.push(`- Files analysed: **${report.overall.fileCount}**`);
  lines.push(`- Methods/constructors analysed: **${report.overall.unitCount}**`);
  lines.push(`- Total cognitive complexity: **${report.overall.totalCognitiveComplexity}**`);
  lines.push(`- Average cognitive complexity per executable unit: **${formatDecimal(report.overall.averageCognitivePerUnit)}**`);
  lines.push("");
  lines.push("## File overview");
  lines.push("");
  lines.push("| Java file | Methods/ctors | Total CogC | Avg/unit | Most complex unit | Unit CogC |");
  lines.push("|---|---:|---:|---:|---|---:|");

  for (const file of report.files) {
    lines.push(
      `| \`${file.file}\` | ${file.unitCount} | ${file.totalCognitiveComplexity} | ${formatDecimal(file.averageCognitivePerUnit)} | ${file.maxUnit ? `\`${file.maxUnit.name}\`` : "-"} | ${file.maxUnit ? file.maxUnit.cognitiveComplexity : 0} |`
    );
  }

  lines.push("");
  lines.push("## Top methods across the analysed Java classes");
  lines.push("");
  lines.push("| Rank | Method | Kind | File | Lines | CogC | Breakdown |");
  lines.push("|---:|---|---|---|---|---:|---|");

  report.topUnits.forEach((unit, index) => {
    lines.push(
      `| ${index + 1} | \`${unit.name}\` | ${unit.kind} | \`${unit.file}\` | ${unit.startLine}-${unit.endLine} | ${unit.cognitiveComplexity} | ${formatBreakdown(unit.breakdown)} |`
    );
  });

  lines.push("");
  return lines.join("\n");
}

function buildReport(targetFiles) {
  const summary = summarizeJavaFiles(targetFiles);

  return {
    generatedAt: new Date().toISOString(),
    script: "MDEThesis/Compare/Cognitive Complexity/compare-java-cognitive-complexity.js",
    scannedFiles: targetFiles,
    notes: [
      "Transparent source-based cognitive-complexity heuristic for the ANIMO generator classes used in the compare chapter.",
      "The heuristic counts control-flow breaks and adds an extra penalty for nested structures.",
      "Comments and string literals are ignored so generated UPPAAL/XML text does not distort the score."
    ],
    overall: {
      fileCount: summary.fileCount,
      unitCount: summary.unitCount,
      totalCognitiveComplexity: summary.totalCognitiveComplexity,
      averageCognitivePerFile: summary.averageCognitivePerFile,
      averageCognitivePerUnit: summary.averageCognitivePerUnit,
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

  const jsonPath = path.join(outputDir, "compare_java_cognitive_complexity.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdPath = path.join(outputDir, "compare_java_cognitive_complexity.md");
  fs.writeFileSync(mdPath, makeMarkdown(report), "utf8");

  console.log(`Analysed ${report.overall.fileCount} Java files`);
  console.log(
    `overall: units=${report.overall.unitCount}, totalCogC=${report.overall.totalCognitiveComplexity}, avgPerUnit=${formatDecimal(report.overall.averageCognitivePerUnit)}`
  );
  for (const file of report.files) {
    console.log(
      `${path.basename(file.file)}: units=${file.unitCount}, totalCogC=${file.totalCognitiveComplexity}, avgPerUnit=${formatDecimal(file.averageCognitivePerUnit)}`
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
