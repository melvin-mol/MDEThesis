# Master's Thesis: Model-Driven Engineering for ANIMO Extensibility

This repository contains the code associated with the Master's thesis titled **"Improving ANIMO's Extensibility through Model-Driven Engineering."** This research applies Model-Driven Engineering (MDE) to make the ANIMO framework more modular and easier to extend.

## Key Contributions

* **Uppaal Code Syntax:** A dedicated library providing a standardized foundation to simplify writing UPPAAL ETL transformations.
* **New File Structure:** An architecture for setting up and organizing UPPAAL ETL transformations.
* **Transformed Models:** Three reference ANIMO models converted using the new framework.
* **ETL Inheritance:** A method for implementing inheritance within UPPAAL ETL transformations to increase code reuse.
* **UppaalEMF Extension:** Functional additions and improvements to the existing [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF).

## Directories

* **[Code Duplication Scripts/](Code%20Duplication%20Scripts/)** - Scripts used in the thesis to measure duplication in the [ANIMO](https://apps.cytoscape.org/apps/animo) codebase to identify transformation logic that can be generalized.
* **[Uppaal Code Syntax/](Uppaal%20Code%20Syntax/)** - A shared standard library for writing UPPAAL ETL transformations in a more easier to read and reusable, code-like style.
* **[UppaalEMF Extension/](UppaalEMF%20Extension/)** - An extension of the original [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF) that resolves bugs and adds additional features.