const fs = require("fs");
const path = require("path");

const {
  summarizeJavaFiles,
  formatDecimal,
  formatBreakdown,
  toRepoRel,
  toAbs
} = require("./compare-java-cognitive-complexity.js");

const THESIS_SIMPLIFIED_RC_PREFIX =
  "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/";

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
    id: "rc_thesis_vs_thesis_inheritance_excluded",
    label: "Reactant-centered deterministic inheritance saving",
    leftLabel: "Thesis",
    leftType: "etl-closure",
    leftEntries: [THESIS_ETL.deterministicRc],
    rightLabel: "Thesis with inherited simplified logic excluded",
    rightType: "etl-closure",
    rightEntries: [THESIS_ETL.deterministicRc],
    rightExcludePathPrefixes: [THESIS_SIMPLIFIED_RC_PREFIX]
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

  const firstUnitStart = units.length
    ? units.reduce((min, unit) => Math.min(min, unit.start), units[0].start)
    : source.length;

  let mainBody = source.slice(0, firstUnitStart);
  mainBody = mainBody.replace(/^\s*import\s+["'][^"']+["']\s*;\s*$/gm, "");
  mainBody = mainBody.replace(/^\s*[@$].*$/gm, "");

  if (mainBody.trim().length > 0) {
    units.push({
      kind: "main",
      name: "main",
      startLine: 1,
      endLine: lineNumberAt(source, firstUnitStart),
      body: mainBody
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

function countQuestionLikePositions(text) {
  const positions = {
    ternary: [],
    elvis: [],
    nullCoalescingAssign: []
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

      if (next === ".") {
        continue;
      } else if (next === ":") {
        positions.elvis.push(i);
      } else if (next === "=") {
        positions.nullCoalescingAssign.push(i);
      } else {
        positions.ternary.push(i);
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
  const questionPositions = countQuestionLikePositions(commentFree);
  const depthMap = makeBraceDepthMap(sanitized);

  const breakdown = {
    ifStatements: scorePositions(countPositions(sanitized, /\bif\s*\(/g), depthMap, true),
    forLoops: scorePositions(countPositions(sanitized, /\bfor\s*\(/g), depthMap, true),
    whileLoops: scorePositions(countPositions(sanitized, /\bwhile\s*\(/g), depthMap, true),
    switchStatements: scorePositions(countPositions(sanitized, /\bswitch\s*\(/g), depthMap, true),
    guardClauses: scorePositions(countPositions(sanitized, /\bguard\b/g), depthMap, true),
    transactionStatements: scorePositions(countPositions(sanitized, /\btransaction\b/g), depthMap, true),
    selectPredicates: scorePositions(countPositions(sanitized, /\bselect(?:One|ByKind|ByType)?\s*\(/g), depthMap, true),
    collectTransforms: scorePositions(countPositions(sanitized, /\bcollect\s*\(/g), depthMap, true),
    existsPredicates: scorePositions(countPositions(sanitized, /\bexists\s*\(/g), depthMap, true),
    forAllPredicates: scorePositions(countPositions(sanitized, /\bforAll\s*\(/g), depthMap, true),
    rejectPredicates: scorePositions(countPositions(sanitized, /\breject(?:One)?\s*\(/g), depthMap, true),
    onePredicates: scorePositions(countPositions(sanitized, /\bone\s*\(/g), depthMap, true),
    nonePredicates: scorePositions(countPositions(sanitized, /\bnone\s*\(/g), depthMap, true),
    countPredicates: scorePositions(countPositions(sanitized, /\bcount\s*\(/g), depthMap, true),
    nMatchPredicates: scorePositions(countPositions(sanitized, /\bnMatch\s*\(/g), depthMap, true),
    atLeastNMatchPredicates: scorePositions(countPositions(sanitized, /\batLeastNMatch\s*\(/g), depthMap, true),
    atMostNMatchPredicates: scorePositions(countPositions(sanitized, /\batMostNMatch\s*\(/g), depthMap, true),
    closureTraversals: scorePositions(countPositions(sanitized, /\bclosure\s*\(/g), depthMap, true),
    aggregateTransforms: scorePositions(countPositions(sanitized, /\baggregate\s*\(/g), depthMap, true),
    mapByTransforms: scorePositions(countPositions(sanitized, /\bmapBy\s*\(/g), depthMap, true),
    sortByTransforms: scorePositions(countPositions(sanitized, /\bsortBy\s*\(/g), depthMap, true),
    ternaryOperators: scorePositions(questionPositions.ternary, depthMap, true),
    elvisOperators: scorePositions(questionPositions.elvis, depthMap, true),
    nullCoalescingAssignments: scorePositions(questionPositions.nullCoalescingAssign, depthMap, true),
    logicalAnd: countPositions(sanitized, /\band\b/g).length,
    logicalOr: countPositions(sanitized, /\bor\b/g).length,
    logicalXor: countPositions(sanitized, /\bxor\b/g).length,
    logicalImplies: countPositions(sanitized, /\bimplies\b/g).length,
    breakStatements: countPositions(sanitized, /\bbreak\b/g).length,
    breakAllStatements: countPositions(sanitized, /\bbreakAll\b/g).length,
    continueStatements: countPositions(sanitized, /\bcontinue\b/g).length,
    throwStatements: countPositions(sanitized, /\bthrow\b/g).length,
    abortStatements: countPositions(sanitized, /\babort\b/g).length
  };

  const cognitiveComplexity = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    cognitiveComplexity,
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
    extension: path.extname(absPath).toLowerCase(),
    unitCount: units.length,
    totalCognitiveComplexity,
    averageCognitivePerUnit: units.length ? totalCognitiveComplexity / units.length : 0,
    maxUnit: units.length ? units[0] : null,
    totalsByDecision: summarizeBreakdown(units.map((unit) => unit.breakdown)),
    units
  };
}

function summarizeAnalyzedEtlFiles(analyzedFiles) {
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

function excludeConfiguredPaths(absFiles, excludePathPrefixes = []) {
  if (!excludePathPrefixes || excludePathPrefixes.length === 0) {
    return absFiles;
  }

  return absFiles.filter((absPath) => {
    const relPath = toRepoRel(absPath);
    return !excludePathPrefixes.some((prefix) => relPath.startsWith(prefix));
  });
}

function summarizeConfigured(config) {
  if (config.type === "java-fixed") {
    return summarizeJavaFiles(config.files);
  }

  if (config.type === "etl-closure") {
    const resolvedFiles = excludeConfiguredPaths(resolveEtlClosure(config.entries), config.excludePathPrefixes);
    return summarizeAnalyzedEtlFiles(resolvedFiles.map(analyzeEtlFile));
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
    totalCognitiveComplexity: summary.totalCognitiveComplexity,
    averageCognitivePerFile: summary.averageCognitivePerFile,
    averageCognitivePerUnit: summary.averageCognitivePerUnit,
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
      totalDeltaPct: percentageDelta(groups[group.id].totalCognitiveComplexity, baselineGroup.totalCognitiveComplexity),
      averagePerFileDeltaPct: percentageDelta(groups[group.id].averageCognitivePerFile, baselineGroup.averageCognitivePerFile),
      averagePerUnitDeltaPct: percentageDelta(groups[group.id].averageCognitivePerUnit, baselineGroup.averageCognitivePerUnit)
    };
  }

  const variantComparisons = VARIANT_COMPARISONS.map((variant) => {
    const left = summarizeConfigured({
      type: variant.leftType,
      files: variant.leftFiles,
      entries: variant.leftEntries,
      excludePathPrefixes: variant.leftExcludePathPrefixes
    });
    const right = summarizeConfigured({
      type: variant.rightType,
      files: variant.rightFiles,
      entries: variant.rightEntries,
      excludePathPrefixes: variant.rightExcludePathPrefixes
    });

    return {
      id: variant.id,
      label: variant.label,
      leftLabel: variant.leftLabel,
      rightLabel: variant.rightLabel,
      left: summarizeComparisonSide(left),
      right: summarizeComparisonSide(right),
      totalDeltaPct: percentageDelta(right.totalCognitiveComplexity, left.totalCognitiveComplexity),
      averagePerFileDeltaPct: percentageDelta(right.averageCognitivePerFile, left.averageCognitivePerFile),
      averagePerUnitDeltaPct: percentageDelta(right.averageCognitivePerUnit, left.averageCognitivePerUnit)
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

  lines.push("# RQ5 Cognitive Complexity Measurements");
  lines.push("");
  lines.push("This report was generated by `MDEThesis/Compare/Cognitive Complexity/compare-etl-cognitive-complexity.js`.");
  lines.push("");
  lines.push("## Reported metric");
  lines.push("");
  lines.push("The report uses a transparent source-based heuristic for **cognitive complexity** across the compared Java and ETL/EOL artefacts.");
  lines.push("It is inspired by the idea that control-flow breaks increase mental load, and that nesting increases that load further.");
  lines.push("");
  lines.push("For ETL/EOL, the counted constructs are grounded in the official Epsilon documentation: EOL contributes statements such as `if`, `switch`, `while`, `for`, `break`, `continue`, `throw`, the ternary and Elvis operators, and documented first-order operations such as `select`, `collect`, `exists`, `forAll`, `reject`, `one`, `none`, `count`, `nMatch`, `closure`, `mapBy`, and `sortBy`; ETL adds rule guards together with `pre`/`post` blocks and rule bodies that are written in EOL.");
  lines.push("");
  lines.push("> This is a documented heuristic for thesis comparison purposes, not an AST-based Sonar implementation.");
  lines.push("");
  lines.push("## Portfolio totals");
  lines.push("");
  lines.push("| Group | Files | Units | Total CogC | Avg/file | Avg/unit | Max unit CogC |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    lines.push(
      `| ${result.label} | ${result.fileCount} | ${result.unitCount} | ${result.totalCognitiveComplexity} | ${formatDecimal(result.averageCognitivePerFile)} | ${formatDecimal(result.averageCognitivePerUnit)} | ${result.maxUnit ? result.maxUnit.cognitiveComplexity : 0} |`
    );
  }

  lines.push("");
  lines.push("## Relative to the corresponding ANIMO 3.5.1 baseline portfolio");
  lines.push("");
  lines.push("| Comparison | Total CogC delta | Avg/file delta | Avg/unit delta |");
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
  lines.push("## Per-comparison cognitive totals");
  lines.push("");
  lines.push("| Comparison | Left files | Right files | Left units | Right units | Left CogC | Right CogC | Left avg/file | Right avg/file | Left avg/unit | Right avg/unit | Total CogC delta | Avg/file delta | Avg/unit delta |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");

  for (const variant of report.variantComparisons) {
    lines.push(
      `| ${variant.label} (${variant.leftLabel} -> ${variant.rightLabel}) | ${variant.left.fileCount} | ${variant.right.fileCount} | ${variant.left.unitCount} | ${variant.right.unitCount} | ${variant.left.totalCognitiveComplexity} | ${variant.right.totalCognitiveComplexity} | ${formatDecimal(variant.left.averageCognitivePerFile)} | ${formatDecimal(variant.right.averageCognitivePerFile)} | ${formatDecimal(variant.left.averageCognitivePerUnit)} | ${formatDecimal(variant.right.averageCognitivePerUnit)} | ${formatDelta(variant.totalDeltaPct)} | ${formatDelta(variant.averagePerFileDeltaPct)} | ${formatDelta(variant.averagePerUnitDeltaPct)} |`
    );
  }

  lines.push("");
  lines.push("## Most complex routines across the analysed artefacts");
  lines.push("");
  lines.push("| Rank | Group | Routine | Kind | File | CogC | Breakdown |");
  lines.push("|---:|---|---|---|---|---:|---|");

  report.overall.topUnits.forEach((unit, index) => {
    lines.push(
      `| ${index + 1} | ${unit.group} | \`${unit.name}\` | ${unit.kind} | \`${unit.file}\` | ${unit.cognitiveComplexity} | ${formatBreakdown(unit.breakdown)} |`
    );
  });

  lines.push("");
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
            cognitiveComplexity: unit.cognitiveComplexity,
            breakdown: unit.breakdown
          });
        }
      }
    }
  }

  const topUnits = Array.from(uniqueUnits.values()).sort((a, b) => {
    if (b.cognitiveComplexity !== a.cognitiveComplexity) return b.cognitiveComplexity - a.cognitiveComplexity;
    return a.name.localeCompare(b.name);
  });

  return {
    generatedAt: new Date().toISOString(),
    script: "MDEThesis/Compare/Cognitive Complexity/compare-etl-cognitive-complexity.js",
    notes: [
      "The report follows the same comparison split as the character-count and cyclomatic-complexity analyses: Thesis vs ANIMO 3.5.1 for the implemented automata, and ANIMO 3.5.1 vs Telniouk for the variants available in the earlier ETL work.",
      "Thesis and Telniouk results include the full transitive ETL import closure from the configured entry ETL files.",
      "The heuristic is grounded in the official EOL and ETL documentation and counts breaks in linear flow with an extra penalty for nesting."
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

  const jsonPath = path.join(outputDir, "compare_cognitive_complexity.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdPath = path.join(outputDir, "compare_cognitive_complexity.md");
  fs.writeFileSync(mdPath, makeMarkdown(report), "utf8");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    console.log(
      `${group.id}: files=${result.fileCount}, units=${result.unitCount}, totalCogC=${result.totalCognitiveComplexity}, avgPerUnit=${formatDecimal(result.averageCognitivePerUnit)}`
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
