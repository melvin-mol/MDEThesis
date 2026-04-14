const fs = require("fs");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..", "..");

const THESIS_UPPAAL_CODE_SYNTAX_PREFIXES = [
  "MDEThesis/Case Study/epsilon transformations/shared libraries/uppaal code syntax/"
];

const THESIS_SIMPLIFIED_RC_PREFIX =
  "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/";

const THESIS_UPPAAL_AND_INHERITED_SIMPLIFIED_EXCLUDES = [
  ...THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
  THESIS_SIMPLIFIED_RC_PREFIX
];

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
    id: "animo3_baseline_portfolio",
    label: "ANIMO 3.5.1 baseline portfolio (Java implementations for the three implemented automata)",
    type: "java-fixed",
    files: [ANIMO_JAVA.simplifiedRc, ANIMO_JAVA.deterministicRc, ANIMO_JAVA.ode]
  },
  {
    id: "thesis_portfolio",
    label: "Thesis portfolio (ETL closure for the implemented case-study automata, including Uppaal Code Syntax)",
    type: "etl-closure",
    entries: THESIS_PORTFOLIO_ENTRIES,
    baselineGroupId: "animo3_baseline_portfolio"
  },
  {
    id: "thesis_portfolio_without_uppaal_code_syntax",
    label: "Thesis portfolio (ETL closure for the implemented case-study automata, excluding Uppaal Code Syntax)",
    type: "etl-closure",
    entries: THESIS_PORTFOLIO_ENTRIES,
    excludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    baselineGroupId: "animo3_baseline_portfolio"
  },
  {
    id: "thesis_portfolio_without_uppaal_code_syntax_without_comments",
    label: "Thesis portfolio (ETL closure for the implemented case-study automata, excluding Uppaal Code Syntax and comments)",
    type: "etl-closure",
    entries: THESIS_PORTFOLIO_ENTRIES,
    excludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    stripComments: true,
    baselineGroupId: "animo3_baseline_portfolio"
  },
  {
    id: "animo3_baseline_telniouk_portfolio",
    label: "ANIMO 3.5.1 Telniouk-mapped baseline portfolio (Java implementations for deterministic, ODE, and reaction-centered tables)",
    type: "java-fixed",
    files: [
      ANIMO_JAVA.deterministicRc,
      ANIMO_JAVA.ode,
      ANIMO_JAVA.reactionCenteredTables
    ]
  },
  {
    id: "telniouk_portfolio",
    label: "Telniouk portfolio (ETL closure for the available transformation variants)",
    type: "etl-closure",
    entries: TELNIOUK_PORTFOLIO_ENTRIES,
    baselineGroupId: "animo3_baseline_telniouk_portfolio"
  }
];

const VARIANT_COMPARISONS = [
  {
    id: "rcs_animo3_vs_thesis",
    label: "Reactant-centered simplified",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic_simplified.java"
    ],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/Animo2VariablesModelReactantCenteredDeterministic_simplified.etl"
    ]
  },
  {
    id: "rc_animo3_vs_thesis",
    label: "Reactant-centered deterministic",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic.java"
    ],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ]
  },
  {
    id: "ode_animo3_vs_thesis",
    label: "ODE",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelODE.java"
    ],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ]
  },
  {
    id: "rcs_animo3_vs_thesis_without_uppaal_code_syntax",
    label: "Reactant-centered simplified",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic_simplified.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/Animo2VariablesModelReactantCenteredDeterministic_simplified.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES
  },
  {
    id: "rc_animo3_vs_thesis_without_uppaal_code_syntax",
    label: "Reactant-centered deterministic",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES
  },
  {
    id: "ode_animo3_vs_thesis_without_uppaal_code_syntax",
    label: "ODE",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelODE.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES
  },
  {
    id: "rcs_animo3_vs_thesis_without_uppaal_code_syntax_without_comments",
    label: "Reactant-centered simplified",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic_simplified.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax and comments",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic_simplified/Animo2VariablesModelReactantCenteredDeterministic_simplified.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightStripComments: true
  },
  {
    id: "rc_animo3_vs_thesis_without_uppaal_code_syntax_without_comments",
    label: "Reactant-centered deterministic",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactantCenteredDeterministic.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax and comments",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightStripComments: true
  },
  {
    id: "ode_animo3_vs_thesis_without_uppaal_code_syntax_without_comments",
    label: "ODE",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelODE.java"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax and comments",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightStripComments: true
  },
  {
    id: "rc_telniouk_vs_thesis",
    label: "Reactant-centered deterministic",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactantCenteredDeterministic.etl"
    ],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ]
  },
  {
    id: "ode_telniouk_vs_thesis",
    label: "ODE",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalODE.etl"
    ],
    rightLabel: "Thesis",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ]
  },
  {
    id: "rc_telniouk_vs_thesis_without_uppaal_code_syntax",
    label: "Reactant-centered deterministic",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactantCenteredDeterministic.etl"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES
  },
  {
    id: "rc_telniouk_vs_thesis_without_uppaal_code_syntax_without_comments",
    label: "Reactant-centered deterministic",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactantCenteredDeterministic.etl"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax and comments",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightStripComments: true
  },
  {
    id: "rc_thesis_without_uppaal_vs_thesis_inheritance_excluded",
    label: "Reactant-centered deterministic inheritance saving",
    leftLabel: "Thesis without Uppaal Code Syntax",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    leftExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightLabel: "Thesis without Uppaal Code Syntax and inherited simplified logic excluded",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_AND_INHERITED_SIMPLIFIED_EXCLUDES
  },
  {
    id: "ode_telniouk_vs_thesis_without_uppaal_code_syntax",
    label: "ODE",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalODE.etl"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES
  },
  {
    id: "ode_telniouk_vs_thesis_without_uppaal_code_syntax_without_comments",
    label: "ODE",
    leftLabel: "Telniouk",
    leftType: "etl-closure",
    leftEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalODE.etl"
    ],
    rightLabel: "Thesis without Uppaal Code Syntax and comments",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Case Study/epsilon transformations/models/ODE/Animo2ODE.etl"
    ],
    rightExcludePathPrefixes: THESIS_UPPAAL_CODE_SYNTAX_PREFIXES,
    rightStripComments: true
  },
  {
    id: "rct_animo3_vs_telniouk",
    label: "Reaction-centered tables",
    leftLabel: "ANIMO 3.5.1",
    leftType: "java-fixed",
    leftFiles: [
      "animo3/src/main/java/animo/core/analyser/uppaal/VariablesModelReactionCenteredTables.java"
    ],
    rightLabel: "Telniouk",
    rightType: "etl-closure",
    rightEntries: [
      "MDEThesis/Telniouk his transformations/transformationdefinitions/Animo2UppaalReactionCenteredTables.etl"
    ]
  }
];

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function stripCommentsPreserveLines(source) {
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

function measureCharacters(text, options = {}) {
  const normalized = normalizeNewlines(text);
  if (options.stripComments) {
    return stripCommentsPreserveLines(normalized).length;
  }
  return normalized.length;
}

function toAbs(relPath) {
  return path.resolve(WORKSPACE_ROOT, relPath);
}

function toRepoRel(absPath) {
  return path.relative(WORKSPACE_ROOT, absPath).replace(/\\/g, "/");
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

function resolveConfiguredFiles(config) {
  let resolvedFiles;

  if (config.type === "java-fixed") {
    resolvedFiles = config.files.map((rel) => toAbs(rel));
  } else if (config.type === "etl-closure") {
    resolvedFiles = resolveEtlClosure(config.entries);
  } else {
    throw new Error(`Unknown configuration type: ${config.type}`);
  }

  return excludeConfiguredPaths(resolvedFiles, config.excludePathPrefixes);
}

function measureConfigured(config, options = {}) {
  return measureFiles(resolveConfiguredFiles(config), options);
}

function measureFiles(absFiles, options = {}) {
  const measuredFiles = [];
  let totalChars = 0;

  for (const abs of absFiles) {
    const content = fs.readFileSync(abs, "utf8");
    const chars = measureCharacters(content, options);
    totalChars += chars;
    measuredFiles.push({ file: toRepoRel(abs), chars });
  }

  measuredFiles.sort((a, b) => a.file.localeCompare(b.file));

  return {
    fileCount: measuredFiles.length,
    totals: { chars: totalChars },
    files: measuredFiles
  };
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

function buildReportData() {
  const groups = {};

  for (const group of GROUPS) {
    groups[group.id] = {
      label: group.label,
      ...measureConfigured(group, { stripComments: Boolean(group.stripComments) })
    };
  }

  const baselineComparisons = {};

  for (const group of GROUPS) {
    if (!group.baselineGroupId) continue;
    const baselineGroup = groups[group.baselineGroupId];
    baselineComparisons[group.id] = {
      baselineGroupId: group.baselineGroupId,
      baselineLabel: baselineGroup.label,
      deltaPct: percentageDelta(groups[group.id].totals.chars, baselineGroup.totals.chars)
    };
  }

  const variantComparisons = VARIANT_COMPARISONS.map((variant) => {
    const left = measureConfigured({
      type: variant.leftType,
      files: variant.leftFiles,
      entries: variant.leftEntries,
      excludePathPrefixes: variant.leftExcludePathPrefixes
    }, { stripComments: Boolean(variant.leftStripComments) });
    const right = measureConfigured({
      type: variant.rightType,
      files: variant.rightFiles,
      entries: variant.rightEntries,
      excludePathPrefixes: variant.rightExcludePathPrefixes
    }, { stripComments: Boolean(variant.rightStripComments) });

    return {
      id: variant.id,
      label: variant.label,
      leftLabel: variant.leftLabel,
      rightLabel: variant.rightLabel,
      left: { fileCount: left.fileCount, totals: left.totals },
      right: { fileCount: right.fileCount, totals: right.totals },
      deltaPct: percentageDelta(right.totals.chars, left.totals.chars)
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

  lines.push("# RQ5 Character Count Measurements");
  lines.push("");
  lines.push("This report was generated by `MDEThesis/Compare/Characters/compare-characters.js`.");
  lines.push("");
  lines.push("## Reported metric");
  lines.push("");
  lines.push("Counts are measured after the configured profile preprocessing. By default this is exactly as stored in the files, with line endings normalized to LF for stable cross-platform counting; the comment-excluded thesis profile removes `//` and `/*...*/` comment text before counting.");
  lines.push("");
  lines.push("## Portfolio totals");
  lines.push("");
  lines.push("| Group | Files | Characters |");
  lines.push("|---|---:|---:|");

  for (const group of GROUPS) {
    const result = report.groups[group.id];
    lines.push(`| ${result.label} | ${result.fileCount} | ${result.totals.chars} |`);
  }

  lines.push("");
  lines.push("## Relative to the corresponding ANIMO 3.5.1 baseline portfolio");
  lines.push("");
  lines.push("| Comparison | Characters delta |");
  lines.push("|---|---:|");

  for (const group of GROUPS) {
    if (!group.baselineGroupId) continue;
    const result = report.groups[group.id];
    const comparison = report.baselineComparisons[group.id];
    lines.push(`| ${result.label} vs ${comparison.baselineLabel} | ${formatDelta(comparison.deltaPct)} |`);
  }

  lines.push("");
  lines.push("## Per-comparison character totals");
  lines.push("");
  lines.push("| Comparison | Left files | Right files | Left chars | Right chars | Chars delta |");
  lines.push("|---|---:|---:|---:|---:|---:|");

  for (const variant of report.variantComparisons) {
    lines.push(`| ${variant.label} (${variant.leftLabel} -> ${variant.rightLabel}) | ${variant.left.fileCount} | ${variant.right.fileCount} | ${variant.left.totals.chars} | ${variant.right.totals.chars} | ${formatDelta(variant.deltaPct)} |`);
  }

  lines.push("");
  return lines.join("\n");
}

function buildReport() {
  return {
    generatedAt: new Date().toISOString(),
    script: "MDEThesis/Compare/Characters/compare-characters.js",
    notes: [
      "The report uses two mapped ANIMO 3.5.1 portfolio baselines: one for the thesis-implemented automata and one for the Telniouk-available automata.",
      "Thesis and Telniouk counts include the full transitive ETL import closure from the configured entry ETL files.",
      "The report includes thesis counts with Uppaal Code Syntax included, with it excluded, and with both Uppaal Code Syntax and comment text excluded.",
      "The deterministic thesis comparison also includes an inheritance-excluded run that omits the imported simplified closure together with Uppaal Code Syntax.",
      "Comment exclusion removes // and /*...*/ comment text while preserving the remaining layout.",
      "Character counts are measured on LF-normalized text for cross-platform stability."
    ],
    ...buildReportData()
  };
}

function main() {
  const outputDir = path.join(__dirname, "compare-results");
  fs.mkdirSync(outputDir, { recursive: true });

  const report = buildReport();

  const jsonPath = path.join(outputDir, "compare_characters.json");
  const mdPath = path.join(outputDir, "compare_characters.md");

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(mdPath, makeMarkdown(report), "utf8");

  console.log(`Wrote ${path.relative(WORKSPACE_ROOT, jsonPath).replace(/\\/g, "/")}`);
  console.log(`Wrote ${path.relative(WORKSPACE_ROOT, mdPath).replace(/\\/g, "/")}`);
}

main();
