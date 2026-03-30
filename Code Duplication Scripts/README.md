# Code Duplication Scripts

Node.js scripts to detect and inspect line-based code duplication used in the thesis for:

- the ANIMO Java codebase
- the Telniouk ETL transformation codebase ([repository](https://github.com/CaseStudyAnimoMde/files))
- the UPPAAL NTA XML outputs (included in `Uppaal NTA Outputs/`)

## Included scripts

- `duplication-collector.js <N>`
	- Scans files from a fixed scan root (`./src/main`) and writes duplicate groups to `duplicationDirectory<N>lines.json`.
- `duplication-analyser.js <N>`
	- Reads `duplicationDirectory<N>lines.json`, prints the most frequent duplicates, and exports snippets.
- `duplication-reconstructor.js <N>`
	- Generates per-file annotated outputs in `DuplicationOutput<N>Lines/`.
- `duplication-collect-analyser.js <N>`
	- Spot-check helper for one known duplication location.
- `compare-two-files.js <fileA> <fileB> <outputFile>`
	- Standalone line-based diff report.
- `count-duplication-groups.js`
	- Scans `duplicationDirectory*lines.json` in this directory and writes `duplication-group-counts.txt`.
- `duplication-report-lib.js`
	- Shared metrics helpers for report generation scripts.
- `generate-duplication-trends.js`
	- Writes `duplication_trends.txt` (cross-`N` top-5 pair concentration and recurring pairs).
- `generate-duplication-deep-trends.js`
	- Writes `duplication_deep_trends.txt` (retention, extinction point, recurring hotspot files).
- `generate-duplication-summary-full.js`
	- Writes `duplication_summary_full.txt` (per-`N` top pairs/files and counts).
- `generate-duplication-reports.js`
	- Runs all three report generators above.
- `file-counter.js`
	- Shared helper imported by collector scripts.

## Data directory: UPPAAL NTA Outputs

This repository includes the six XML files used in RQ1 duplication analysis under `Uppaal NTA Outputs/`:

- `Ordinary Differential Equations (ODEs) for UPPAAL.xml`
- `Reactant-centered model (old, less precise).xml`
- `Reactant-centered model (simplified).xml`
- `Reactant-centered model (uses clock tick 0 uncertainty only. Also normal MC only).xml`
- `Reaction centered model with pre-computed tables, old version.xml`
- `Reaction-centered model with pre-computed tables.xml`

These are the UPPAAL NTA outputs analyzed in the thesis for recurring structures and duplication patterns.

## Normalization behavior

For duplication checks (`duplication-collector.js`):

- Leading/trailing whitespace is ignored (`line.trim()`).
- Empty lines are normalized to one placeholder value.
- Line endings (LF vs CRLF) are effectively normalized by line-based reading.

For `compare-two-files.js`, lines are compared exactly as read (no trimming), so whitespace differences are reported.

## Typical workflow

Run from this directory:

1. `node duplication-collector.js 10`
2. `node duplication-analyser.js 10`
3. `node duplication-reconstructor.js 10`
4. `node count-duplication-groups.js`
5. `node generate-duplication-reports.js`

## Thesis-aligned runs

The thesis used multiple `N` values per dataset.

- ANIMO run set includes: `10, 52, 60, 75, 103, 108, 119, 120, 125, 150, 200, 250, 300, 400, 500, 716, 717`
- Telniouk run set includes: `5, 10, 15, 16, 17, 18, 19, 20`
- UPPAAL NTA runs include a broad range from small to large block sizes, including values around the extinction boundary (`2786` and `2787`) reported in the appendix.

## Dependency note

- `duplication-collector.js` and `duplication-collect-analyser.js` import `./file-counter.js`.