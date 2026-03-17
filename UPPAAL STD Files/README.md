# UPPAAL STD Files
Writing UPPAAL ETL transformations directly is verbose, because you often have to build abstract syntax tree structures node by node. In practice, this can require many lines of ETL code. The UPPAAL STD Files provide reusable helper functions that make transformations read more like regular code. This significantly reduces boilerplate, improves readability, and makes transformations easier to maintain. These files are used in the UppaalEMF extension. For example, a simple expression can take many lines when written manually, but only a single line when using the UPPAAL STD Files. An example is shown below.

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