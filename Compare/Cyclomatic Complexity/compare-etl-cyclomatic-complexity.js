const fs = require("fs");
const path = require("path");

const {
  summarizeJavaFiles,
  formatDecimal,
  formatBreakdown,
  toRepoRel,
  toAbs
} = require("./compare-java-cyclomatic-complexity.js");

const ANIMO_JAVA = {
  simplifiedRc:
    "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic_simplified.java",
  deterministicRc:
    "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic.java",
  ode: "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelODE.java",
  reactionCenteredTables:
    "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactionCenteredTables.java"
};

const THESIS_ETL = {
  simplifiedRc:
    "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/Animo2VariablesModelReactantCenteredDeterministic_simplified.etl",
  deterministicRc:
    "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl",
  ode: "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
};

const THESIS_PORTFOLIO_ENTRIES = [
  THESIS_ETL.simplifiedRc,
  THESIS_ETL.deterministicRc,
  THESIS_ETL.ode
];

const TELNIOUK_ETL = {
  deterministicRc:
    "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactantCenteredDeterministic.etl",
  reactionCenteredTables:
    "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactionCenteredTables.etl",
  ode: "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalODE.etl"
};

const TELNIOUK_PORTFOLIO_ENTRIES = [
  TELNIOUK_ETL.deterministicRc,
  TELNIOUK_ETL.reactionCenteredTables,
  TELNIOUK_ETL.ode
];

const GROUPS = [
  {
    id: "animo3_thesis_baseline_portfolio",
    label: "ANIMO 3.5.1 baseline portfolio (Java implementations for the three implemented automata)",
    type: "java-fixed",
    files: [ANIMO_JAVA.simplifiedRc, ANIMO_JAVA.deterministicRc, ANIMO_JAVA.ode]
  },
  {
    id: "thesis_portfolio",
    label: "Thesis portfolio (ETL closure for the implemented case-study automata)",
    type: "etl-closure",
    entries: THESIS_PORTFOLIO_ENTRIES,
    baselineGroupId: "animo3_thesis_baseline_portfolio"
  },
  {
    id: "animo3_telniouk_baseline_portfolio",
    label: "ANIMO 3.5.1 Telniouk-mapped baseline portfolio (Java implementations for deterministic, ODE, and reaction-centered tables)",
    type: "java-fixed",
    files: [ANIMO_JAVA.deterministicRc, ANIMO_JAVA.ode, ANIMO_JAVA.reactionCenteredTables]
  },
  {
    id: "telniouk_portfolio",
    label: "Telniouk portfolio (ETL closure for the available transformation variants)",
    type: "etl-closure",
    entries: TELNIOUK_PORTFOLIO_ENTRIES,
    baselineGroupId: "animo3_telniouk_baseline_portfolio"
  }
];

const VARIANT_COMPARISONS = [
  {
    id: "rcs_animo3_vs_thesis",
    label: "Reactant-centered simplified",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.simplifiedRc],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [THESIS_ETL.simplifiedRc]
  },
  {
    id: "rc_animo3_vs_thesis",
    label: "Reactant-centered deterministic",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.deterministicRc],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [THESIS_ETL.deterministicRc]
  },
  {
    id: "ode_animo3_vs_thesis",
    label: "ODE",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.ode],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [THESIS_ETL.ode]
  },
  {
    id: "rc_animo3_vs_telniouk",
    label: "Reactant-centered deterministic",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.deterministicRc],
    rightLabel: "Telniouk",
    rightType: "etl-closure",
    rightEntries: [TELNIOUK_ETL.deterministicRc]
  },
  {
    id: "ode_animo3_vs_telniouk",
    label: "ODE",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.ode],
    rightLabel: "Telniouk",
    rightType: "etl-closure",
    rightEntries: [TELNIOUK_ETL.ode]
  },
  {
    id: "reaction_centered_tables_animo3_vs_telniouk",
    label: "Reaction-centered tables",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [ANIMO_JAVA.reactionCenteredTables],
    rightLabel: "Telniouk",
    rightType: "etl-closure",
    rightEntries: [TELNIOUK_ETL.reactionCenteredTables]
  }
];

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
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

function extractName(kind, headerText) {
  const flattened = headerText.replace(/\s+/g, " ").trim();

  if (kind === "operation") {
    const match = flattened.match(/\boperation\b\s+(?:[^\s(]+\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    return match ? match[1] : "(anonymous operation)";
  }

  if (kind === "rule") {
    const match = flattened.match(/\brule\b\s+([A-Za-z_][A-Za-z0-9_]*)/);
    return match ? match[1] : "(anonymous rule)";
  }

  if (kind === "pre" || kind === "post") {
    const match = flattened.match(/\b(?:pre|post)\b\s*([A-Za-z_][A-Za-z0-9_]*)?/);
    return match && match[1] ? match[1] : `(${kind})`;
  }

  return kind;
}

function extractUnits(source) {
  const sanitized = sanitizeSourcePreserveLayout(source);
  const units = [];
  const unitRegex = /^\s*(?:@[^\n]*\n\s*)*(operation|rule|pre|post)\b/gm;
  let match;

  while ((match = unitRegex.exec(sanitized)) !== null) {
    const kind = match[1];
    const start = match.index;
    const openIndex = sanitized.indexOf("{", unitRegex.lastIndex - 1);
    if (openIndex === -1) continue;

    const endIndex = findMatchingBrace(sanitized, openIndex);
    if (endIndex === -1) continue;

    const header = source.slice(start, openIndex).trim();
    const body = source.slice(openIndex + 1, endIndex);

    units.push({
      kind,
      name: extractName(kind, header),
      start,
      end: endIndex + 1,
      startLine: lineNumberAt(source, start),
      endLine: lineNumberAt(source, endIndex),
      body
    });

    unitRegex.lastIndex = endIndex + 1;
  }

  const remaining = sanitized
    .split("")
    .map((char) => (char === "\n" ? "\n" : " "));

  for (const unit of units) {
    for (let i = unit.start; i < unit.end; i += 1) {
      remaining[i] = sanitized[i] === "\n" ? "\n" : " ";
    }
  }

  let mainBody = remaining.join("");
  mainBody = mainBody.replace(/^\s*import\s+["'][^"']+["']\s*;\s*$/gm, "");
  mainBody = mainBody.replace(/^\s*@.*$/gm, "");

  if (mainBody.trim().length > 0) {
    units.push({
      kind: "main",
      name: "main",
      start: 0,
      end: source.length,
      startLine: 1,
      endLine: source.split("\n").length,
      body: mainBody
    });
  }

  return units;
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function countQuestionLikeOperators(text) {
  const counts = {
    ternary: 0,
    elvis: 0,
    nullCoalescingAssign: 0
  };

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

      if (next === ":") {
        counts.elvis += 1;
      } else if (next === "=") {
        counts.nullCoalescingAssign += 1;
      } else if (next !== ".") {
        counts.ternary += 1;
      }
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

  return counts;
}

function compactBreakdown(breakdown) {
  const filtered = {};
  for (const [key, value] of Object.entries(breakdown)) {
    if (value > 0) filtered[key] = value;
  }
  return filtered;
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
  const questionCounts = countQuestionLikeOperators(commentFree);

  const breakdown = {
    ifStatements: countMatches(sanitized, /\bif\s*\(/g),
    forLoops: countMatches(sanitized, /\bfor\s*\(/g),
    whileLoops: countMatches(sanitized, /\bwhile\s*\(/g),
    caseBranches: countMatches(sanitized, /\bcase\b/g),
    guardClauses: countMatches(sanitized, /\bguard\b/g),
    selectPredicates: countMatches(sanitized, /\bselect(?:One)?\s*\(/g),
    existsPredicates: countMatches(sanitized, /\bexists\s*\(/g),
    forAllPredicates: countMatches(sanitized, /\bforAll\s*\(/g),
    rejectPredicates: countMatches(sanitized, /\breject(?:One)?\s*\(/g),
    onePredicates: countMatches(sanitized, /\bone\s*\(/g),
    nonePredicates: countMatches(sanitized, /\bnone\s*\(/g),
    countPredicates: countMatches(sanitized, /\bcount\s*\(/g),
    nMatchPredicates: countMatches(sanitized, /\bnMatch\s*\(/g),
    atLeastNMatchPredicates: countMatches(sanitized, /\batLeastNMatch\s*\(/g),
    atMostNMatchPredicates: countMatches(sanitized, /\batMostNMatch\s*\(/g),
    ternaryOperators: questionCounts.ternary,
    elvisOperators: questionCounts.elvis,
    nullCoalescingAssignments: questionCounts.nullCoalescingAssign,
    logicalAnd: countMatches(sanitized, /\band\b/g),
    logicalOr: countMatches(sanitized, /\bor\b/g),
    logicalXor: countMatches(sanitized, /\bxor\b/g),
    logicalImplies: countMatches(sanitized, /\bimplies\b/g)
  };

  const decisionPoints = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    complexity: 1 + decisionPoints,
    decisionPoints,
    breakdown: compactBreakdown(breakdown)
  };
}

function analyzeEtlFile(absPath) {
  const source = normalizeNewlines(fs.readFileSync(absPath, "utf8"));
  const units = extractUnits(source).map((unit) => {
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
    extension: path.extname(absPath).toLowerCase(),
    unitCount: units.length,
    totalComplexity,
    totalDecisionPoints,
    averageComplexityPerUnit: units.length ? totalComplexity / units.length : 0,
    maxUnit: units.length ? units[0] : null,
    totalsByDecision: summarizeBreakdown(units.map((unit) => unit.breakdown)),
    units
  };
}

function summarizeAnalyzedEtlFiles(analyzedFiles) {
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

function parseImports(etlText) {
  const imports = [];
  const importRegex = /^\s*import\s+"([^"]+)"\s*;/gm;
  let match;

  while ((match = importRegex.exec(etlText)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveEtlClosure(entryRelPaths) {
  const visited = new Set();
  const stack = entryRelPaths.map((rel) => toAbs(rel));

  while (stack.length) {
    const current = path.normalize(stack.pop());
    if (visited.has(current)) continue;

    if (!fs.existsSync(current)) {
      throw new Error(`ETL file not found: ${toRepoRel(current)}`);
    }

    visited.add(current);
    const content = fs.readFileSync(current, "utf8");
    const imports = parseImports(content);

    for (const importPath of imports) {
      stack.push(path.resolve(path.dirname(current), importPath));
    }
  }

  return Array.from(visited).sort((a, b) => a.localeCompare(b));
}

function summarizeConfigured(config) {
  if (config.type === "java-fixed") {
    return summarizeJavaFiles(config.files);
  }

  if (config.type === "etl-closure") {
    return summarizeAnalyzedEtlFiles(resolveEtlClosure(config.entries).map(analyzeEtlFile));
  }

  throw new Error(`Unknown configuration type: ${config.type}`);
}

function percentageDelta(candidate, baseline) {
  if (baseline === 0) return null;
  return ((candidate - baseline) / baseline) * 100;
}

function formatDelta(value) {
  if (value === null) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function summarizeComparisonSide(summary) {
  return {
    fileCount: summary.fileCount,
    unitCount: summary.unitCount,
    totalComplexity: summary.totalComplexity,
    averageComplexityPerFile: summary.averageComplexityPerFile,
    averageComplexityPerUnit: summary.averageComplexityPerUnit,
    maxUnit: summary.maxUnit
  };
}

function buildReportData() {
  const groups = {};

  for (const group of GROUPS) {
    groups[group.id] = {
      label: group.label,
      ...summarizeConfigured(group)
    };
  }

  const baselineComparisons = {};
  for (const group of GROUPS) {
    if (!group.baselineGroupId) continue;

    const baselineGroup = groups[group.baselineGroupId];
    baselineComparisons[group.id] = {
      baselineGroupId: group.baselineGroupId,
      baselineLabel: baselineGroup.label,
      totalDeltaPct: percentageDelta(groups[group.id].totalComplexity, baselineGroup.totalComplexity),
      averagePerFileDeltaPct: percentageDelta(groups[group.id].averageComplexityPerFile, baselineGroup.averageComplexityPerFile),
      averagePerUnitDeltaPct: percentageDelta(groups[group.id].averageComplexityPerUnit, baselineGroup.averageComplexityPerUnit)
    };
  }

  const variantComparisons = VARIANT_COMPARISONS.map((variant) => {
    const left = summarizeConfigured({
      type: variant.leftType,
      files: variant.leftFiles,
      entries: variant.leftEntries
    });
    const right = summarizeConfigured({
      type: variant.rightType,
      files: variant.rightFiles,
      entries: variant.rightEntries
    });

    return {
      id: variant.id,
      label: variant.label,
      leftLabel: variant.leftLabel,
      rightLabel: variant.rightLabel,
      left: summarizeComparisonSide(left),
      right: summarizeComparisonSide(right),
      totalDeltaPct: percentageDelta(right.totalComplexity, left.totalComplexity),
      averagePerFileDeltaPct: percentageDelta(right.averageComplexityPerFile, left.averageComplexityPerFile),
      averagePerUnitDeltaPct: percentageDelta(right.averageComplexityPerUnit, left.averageComplexityPerUnit)
    };
  });

  return {
    groups,
    baselineComparisons,
    variantComparisons
  };
}

function makeMarkdown(report) {
  const lines = [];

  lines.push("# RQ5 Cyclomatic Complexity Measurements");
  lines.push("");
  lines.push("This report was generated by `MDEThesis/Compare/Cyclomatic Complexity/compare-etl-cyclomatic-complexity.js`.");
  lines.push("");
  lines.push("## Reported metric");
  lines.push("");
  lines.push("The report uses a transparent heuristic cyclomatic complexity count across the compared Java and ETL/EOL artefacts. Base complexity is 1 per Java method or constructor and 1 per ETL/EOL executable unit, after which control-flow decision constructs are added with comment-aware parsing so that comments and string literals do not inflate the count.");
  lines.push("");
  lines.push("## Portfolio totals");
  lines.push("");
  lines.push("| Group | Files | Units | Total CC | Avg/file | Avg/unit | Max unit CC |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    lines.push(
      `| ${result.label} | ${result.fileCount} | ${result.unitCount} | ${result.totalComplexity} | ${formatDecimal(result.averageComplexityPerFile)} | ${formatDecimal(result.averageComplexityPerUnit)} | ${result.maxUnit ? result.maxUnit.complexity : 0} |`
    );
  }

  lines.push("");
  lines.push("## Relative to the corresponding ANIMO 3.5.1 baseline portfolio");
  lines.push("");
  lines.push("| Comparison | Total CC delta | Avg/file delta | Avg/unit delta |");
  lines.push("|---|---:|---:|---:|");

  for (const group of GROUPS) {
    if (!group.baselineGroupId) continue;
    const result = report.groups[group.id];
    const comparison = report.baselineComparisons[group.id];
    lines.push(
      `| ${result.label} vs ${comparison.baselineLabel} | ${formatDelta(comparison.totalDeltaPct)} | ${formatDelta(comparison.averagePerFileDeltaPct)} | ${formatDelta(comparison.averagePerUnitDeltaPct)} |`
    );
  }

  lines.push("");
  lines.push("## Per-comparison cyclomatic totals");
  lines.push("");
  lines.push("| Comparison | Left files | Right files | Left units | Right units | Left CC | Right CC | Left avg/file | Right avg/file | Left avg/unit | Right avg/unit | Total CC delta | Avg/file delta | Avg/unit delta |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");

  for (const variant of report.variantComparisons) {
    lines.push(
      `| ${variant.label} (${variant.leftLabel} -> ${variant.rightLabel}) | ${variant.left.fileCount} | ${variant.right.fileCount} | ${variant.left.unitCount} | ${variant.right.unitCount} | ${variant.left.totalComplexity} | ${variant.right.totalComplexity} | ${formatDecimal(variant.left.averageComplexityPerFile)} | ${formatDecimal(variant.right.averageComplexityPerFile)} | ${formatDecimal(variant.left.averageComplexityPerUnit)} | ${formatDecimal(variant.right.averageComplexityPerUnit)} | ${formatDelta(variant.totalDeltaPct)} | ${formatDelta(variant.averagePerFileDeltaPct)} | ${formatDelta(variant.averagePerUnitDeltaPct)} |`
    );
  }

  lines.push("");
  lines.push("## Most complex routines across the analysed artefacts");
  lines.push("");
  lines.push("| Rank | Group | Routine | Kind | File | CC | Decision points | Breakdown |");
  lines.push("|---:|---|---|---|---|---:|---:|---|");

  report.overall.topUnits.forEach((unit, index) => {
    lines.push(
      `| ${index + 1} | ${unit.group} | \`${unit.name}\` | ${unit.kind} | \`${unit.file}\` | ${unit.complexity} | ${unit.decisionPoints} | ${formatBreakdown(unit.breakdown)} |`
    );
  });

  lines.push("");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    lines.push(`## ${result.label}`);
    lines.push("");
    lines.push("### File totals");
    lines.push("");
    lines.push("| File | Units | Total CC | Decision points | Max unit CC |");
    lines.push("|---|---:|---:|---:|---:|");

    for (const file of result.files) {
      lines.push(
        `| \`${file.file}\` | ${file.unitCount} | ${file.totalComplexity} | ${file.totalDecisionPoints} | ${file.maxUnit ? file.maxUnit.complexity : 0} |`
      );
    }

    lines.push("");
    lines.push("### Top routines in this group");
    lines.push("");
    lines.push("| Routine | Kind | File | Lines | CC | Breakdown |");
    lines.push("|---|---|---|---|---:|---|");

    for (const unit of result.topUnits) {
      lines.push(
        `| \`${unit.name}\` | ${unit.kind} | \`${unit.file}\` | ${unit.startLine}-${unit.endLine} | ${unit.complexity} | ${formatBreakdown(unit.breakdown)} |`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

function buildReport() {
  const data = buildReportData();
  const uniqueUnits = new Map();
  const uniqueFiles = new Set();

  for (const group of Object.values(data.groups)) {
    for (const file of group.files) {
      uniqueFiles.add(file.file);

      for (const unit of file.units) {
        const key = `${file.file}|${unit.kind}|${unit.name}|${unit.startLine}|${unit.endLine}`;
        if (!uniqueUnits.has(key)) {
          uniqueUnits.set(key, {
            group: group.label,
            file: file.file,
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
    }
  }

  const topUnits = Array.from(uniqueUnits.values()).sort((a, b) => {
    if (b.complexity !== a.complexity) return b.complexity - a.complexity;
    if (b.decisionPoints !== a.decisionPoints) return b.decisionPoints - a.decisionPoints;
    return a.name.localeCompare(b.name);
  });

  return {
    generatedAt: new Date().toISOString(),
    script: "MDEThesis/Compare/Cyclomatic Complexity/compare-etl-cyclomatic-complexity.js",
    notes: [
      "The report follows the same comparison split as the character-count analysis: Thesis vs ANIMO 3.5.1 for the implemented automata, and ANIMO 3.5.1 vs Telniouk for the variants available in the earlier ETL work.",
      "Thesis and Telniouk results include the full transitive ETL import closure from the configured entry ETL files.",
      "No separate comment-filter or Uppaal Code Syntax exclusion profiles are reported here."
    ],
    overall: {
      fileCount: uniqueFiles.size,
      unitCount: topUnits.length,
      topUnits: topUnits.slice(0, 20)
    },
    ...data
  };
}

function main() {
  const outputDir = path.join(__dirname, "compare-results");
  ensureDirectoryExists(outputDir);

  const report = buildReport();

  const jsonPath = path.join(outputDir, "compare_cyclomatic_complexity.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdPath = path.join(outputDir, "compare_cyclomatic_complexity.md");
  fs.writeFileSync(mdPath, makeMarkdown(report), "utf8");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    console.log(
      `${group.id}: files=${result.fileCount}, units=${result.unitCount}, totalCC=${result.totalComplexity}, avgPerUnit=${formatDecimal(result.averageComplexityPerUnit)}`
    );
  }
  console.log(`Wrote ${toRepoRel(jsonPath)}`);
  console.log(`Wrote ${toRepoRel(mdPath)}`);
}

module.exports = {
  THESIS_ETL,
  TELNIOUK_ETL,
  ANIMO_JAVA,
  resolveEtlClosure,
  analyzeEtlFile,
  buildReport
};

if (require.main === module) {
  main();
}

