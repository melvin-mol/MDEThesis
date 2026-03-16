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

## UPPAAL STD Files
Writing UPPAAL ETL transformations directly is verbose, because you often have to build abstract syntax tree structures node by node. In practice, this can require many lines of ETL code. The UPPAAL STD Files provide reusable helper functions that make transformations read more like regular code. This significantly reduces boilerplate, improves readability, and makes transformations easier to maintain. These files are used in the UppaalEMF extension based on the [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF). For example, a simple expression can take many lines when written manually, but only a single line when using the UPPAAL STD Files. An example is shown below.

**UPPAAL ETL transformation**

``` javascript
    // Transformation for: areCoordinatesValid = x == 25 and y > 100;
    var statement = new Uppaal!ExpressionStatement();
    statement.expression = new Uppaal!AssignmentExpression();
	statement.expression.firstExpr = new Uppaal!LiteralExpression();
	statement.expression.firstExpr.text = "areCoordinatesValid";

	statement.expression.operator = Uppaal!AssignmentOperator#EQUAL;

    statement.expression.secondExpr = new Uppaal!LogicalExpression();
	statement.expression.secondExpr.firstExpr = new Uppaal!CompareExpression();
	statement.expression.secondExpr.firstExpr.firstExpr = new Uppaal!LiteralExpression();
    statement.expression.secondExpr.firstExpr.firstExpr.text = "x";
    statement.expression.secondExpr.firstExpr.operator = Uppaal!CompareOperator#EQUAL;
    statement.expression.secondExpr.firstExpr.secondExpr = new Uppaal!LiteralExpression();
    statement.expression.secondExpr.firstExpr.secondExpr.text = "25";

	statement.expression.secondExpr.operator = Uppaal!LogicalOperator#AND;

	statement.expression.secondExpr.secondExpr = new Uppaal!CompareExpression();
	statement.expression.secondExpr.secondExpr.firstExpr = new Uppaal!LiteralExpression();
    statement.expression.secondExpr.secondExpr.firstExpr.text = "y";
    statement.expression.secondExpr.secondExpr.operator = Uppaal!CompareOperator#GREATER;
    statement.expression.secondExpr.secondExpr.secondExpr = new Uppaal!LiteralExpression();
    statement.expression.secondExpr.secondExpr.secondExpr.text = "100";
```

**UPPAAL ETL transformation with UPPAAL STD files**

``` javascript
    // Transformation for: areCoordinatesValid = x == 25 and y > 100;
    var statement = assign("areCoordinatesValid", and_(equal("x", "25"), greater("y", "100")));
```