# Compare (RQ5 Reproducibility Artifacts)

This directory contains the reproducibility artifacts for the RQ5 comparison in the thesis: scripts, benchmark logs, input models, and generated comparison outputs.

The goal of this folder is to make the RQ5 claims traceable and repeatable on GitHub. It covers four comparison dimensions:

1. Character count
2. Performance
3. Cyclomatic complexity
4. Cognitive complexity

## Scope and Relation to the Thesis

The scripts in this directory were used to produce the comparison evidence.

These artifacts compare:

- ANIMO 3.5.1 Java implementations (not published)
- Thesis ETL transformations: [Reactant-centered simplified](../Case%20Study/epsilon%20transformations/models/VariablesModelReactantCenteredDeterministic_simplified/Animo2VariablesModelReactantCenteredDeterministic_simplified.etl), [Reactant-centered deterministic](../Case%20Study/epsilon%20transformations/models/VariablesModelReactantCenteredDeterministic/Animo2VariablesModelReactantCenteredDeterministic.etl), [ODE](../Case%20Study/epsilon%20transformations/models/ODE/Animo2ODE.etl)
- Telniouk ETL transformations: [CaseStudyAnimoMde/files](https://github.com/CaseStudyAnimoMde/files)

## Directory Structure

```text
Compare/
	Characters/
		compare-characters.js
		compare-results/
			compare_characters.json
			compare_characters.md

	Cyclomatic Complexity/
		compare-etl-cyclomatic-complexity.js
		compare-java-cyclomatic-complexity.js
		compare-results/
			compare_cyclomatic_complexity.json
			compare_cyclomatic_complexity.md
			compare_java_cyclomatic_complexity.json
			compare_java_cyclomatic_complexity.md

	Cognitive Complexity/
		compare-etl-cognitive-complexity.js
		compare-java-cognitive-complexity.js
		compare-results/
			compare_cognitive_complexity.json
			compare_cognitive_complexity.md
			compare_java_cognitive_complexity.json
			compare_java_cognitive_complexity.md

	Performance/
		Performance banchmarks ANIMO 3.5.1.md
		Performance banchmarks thesis implementation.md
		Code/
			AnimoTransformer.java
		Input models/
			*.cys
```

## Prerequisites

- Node.js 18+ (scripts use only built-in Node modules: `fs`, `path`)

## How to Run

Run commands:

```bash
node compare-characters.js
node compare-java-cyclomatic-complexity.js
node compare-etl-cyclomatic-complexity.js
node compare-java-cognitive-complexity.js
node compare-etl-cognitive-complexity.js
```

Each script writes JSON and Markdown outputs to its local `compare-results/` folder.

## Outputs

Generated files are committed to the repository for reproducibility and inspection:

- Machine-readable summaries (`*.json`)
- Human-readable reports (`*.md`)

Performance measurements are documented as benchmark logs in:

- `Performance/Performance banchmarks ANIMO 3.5.1.md`
- `Performance/Performance banchmarks thesis implementation.md`

## Notes and Limitations

- Performance outcomes depend on hardware, JVM/runtime settings, and local environment load.
- Some analysis-stage runs are intentionally documented as exceptions (for example, known ANIMO 3.5.1 reactant-centered behavior on UPPAAL 5 and very large models that remain loading).
- Comparison scripts are designed for the thesis dataset and model variants, not as general-purpose static-analysis tooling.
