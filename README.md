# Master's Thesis: Model-Driven Engineering for ANIMO Extensibility

This repository contains the code associated with the Master's thesis titled **"Improving ANIMO's Extensibility through Model-Driven Engineering."** This research applies Model-Driven Engineering (MDE) to make the ANIMO framework more modular and easier to extend.

**Key Contributions**

* **UPPAAL STD Files:** A dedicated directory providing a standardized foundation to simplify writing UPPAAL ETL transformations.
* **New File Structure:** An architecture for setting up and organizing UPPAAL ETL transformations.
* **Transformed Models:** Three reference ANIMO models converted using the new framework.
* **ETL Inheritance:** A method for implementing inheritance within UPPAAL ETL transformations to increase code reuse.
* **UppaalEMF Extension:** Functional additions and improvements to the existing [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF).


## Code Duplication Scripts
These Node.js scripts measure and inspect line-based code duplication in ANIMO.

* `duplication-collector.js <N>`: Scans files (default: `./src/main`) and writes duplicate groups to `duplicationDirectory<N>lines.json`.
* `duplication-analyser.js <N>`: Reads that JSON, shows the most frequent duplicates, and exports snippets.
* `duplication-reconstructor.js <N>`: Generates per-file annotated outputs in `DuplicationOutput<N>Lines/`.
* `duplication-collect-analyser.js <N>`: Spot-check tool for one known duplication location.
* `compare-two-files.js <fileA> <fileB> <outputFile>`: Standalone line-based diff report.

Typical flow:
1. `node "Code Duplication Scripts/duplication-collector.js" 10`
2. `node "Code Duplication Scripts/duplication-analyser.js" 10`
3. `node "Code Duplication Scripts/duplication-reconstructor.js" 10`

Note: `duplication-collector.js` and `duplication-collect-analyser.js` import `./file-counter.js`.