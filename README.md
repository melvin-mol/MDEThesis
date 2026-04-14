# Master's Thesis: Model-Driven Engineering for ANIMO Extensibility

This repository contains the code associated with the Master's thesis titled **"Improving ANIMO's Extensibility through Model-Driven Engineering."** This research applies Model-Driven Engineering (MDE) to make the ANIMO framework more modular and easier to extend.

## Key Contributions

* **Uppaal Code Syntax:** A dedicated library providing a standardized foundation to simplify writing Uppaal ETL transformations.
* **New File Structure:** An architecture for setting up and organizing Uppaal ETL transformations.
* **Orchestration and Implementations:** An orchestration-based split where orchestration files define what is transformed and in which order, while implementation files contain the model-specific transformation logic.
* **Transformed Models:** Three reference ANIMO models converted using the new framework.
* **ETL Inheritance:** A method for implementing inheritance within Uppaal ETL transformations to increase code reuse.
* **UppaalEMF Extension:** Functional additions and improvements to the existing [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF).

## Directories

* **[Case Study/](Case%20Study/)** - Three reference ANIMO models converted using the new framework, demonstrating the proposed directory structure, Uppaal Code Syntax library, ETL inheritance, and the split between orchestration and implementation files.
* **[Compare/](Compare/)** - Reproducible artifacts for comparison (character count, performance, cyclomatic complexity, and cognitive complexity), including scripts, benchmark logs, and generated report outputs.
* **[Code Duplication Scripts/](Code%20Duplication%20Scripts/)** - Scripts used in the thesis to measure duplication in the [ANIMO](https://apps.cytoscape.org/apps/animo) codebase to identify transformation logic that can be generalized.
* **[Validation/](Validation/)** - Reproducible comparative validation artifacts for UPPAAL XML equivalence, including the input variant networks, the Dataset of paired `Old.xml` and `New.xml` files and the `compare-equivalence.js` checker script used for RQ4.
* **[Uppaal Code Syntax/](Uppaal%20Code%20Syntax/)** - A shared standard library for writing Uppaal ETL transformations in a more easier to read and reusable, code-like style.
* **[UppaalEMF Extension/](UppaalEMF%20Extension/)** - An extension of the original [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF) that resolves bugs and adds additional features.