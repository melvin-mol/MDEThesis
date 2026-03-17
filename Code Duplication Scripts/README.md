# Code Duplication Scripts
These Node.js scripts measure and inspect line-based code duplication in the [ANIMO](https://apps.cytoscape.org/apps/animo) codebase.

* `duplication-collector.js <N>`: Scans files (default: `./src/main`) and writes duplicate groups to `duplicationDirectory<N>lines.json`.
* `duplication-analyser.js <N>`: Reads that JSON, shows the most frequent duplicates, and exports snippets.
* `duplication-reconstructor.js <N>`: Generates per-file annotated outputs in `DuplicationOutput<N>Lines/`.
* `duplication-collect-analyser.js <N>`: Spot-check tool for one known duplication location.
* `compare-two-files.js <fileA> <fileB> <outputFile>`: Standalone line-based diff report.

Normalization and ignored differences (duplication checks):
* Leading and trailing whitespace is ignored (`line.trim()` is used).
* Empty lines are normalized to one placeholder value, so all blank lines are treated as equivalent.
* Line endings (LF vs CRLF) are effectively normalized by line-based reading.

For `compare-two-files.js`, lines are compared exactly as read (no trimming), so whitespace differences are reported.

Typical flow:
1. `node "Code Duplication Scripts/duplication-collector.js" 10`
2. `node "Code Duplication Scripts/duplication-analyser.js" 10`
3. `node "Code Duplication Scripts/duplication-reconstructor.js" 10`

Note: `duplication-collector.js` and `duplication-collect-analyser.js` import `./file-counter.js`.