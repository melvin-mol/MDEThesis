# Uppaal Code Syntax
Writing Uppaal ETL transformations directly is verbose, because you often have to build abstract syntax tree structures node by node. In practice, this can require many lines of ETL code. The Uppaal Code Syntax library provides reusable helper functions that make transformations read more like regular code. This significantly reduces boilerplate, improves readability, and makes transformations easier to maintain. For example, an assignment can take many lines when written manually, but only a single line when using the Uppaal Code Syntax library. An example is shown below.

**Important:** The Uppaal Code Syntax library is designed for the extended metamodel in [UppaalEMF Extension](../UppaalEMF%20Extension/) and should be used with that version instead of the [original UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF).

**Uppaal ETL transformation**

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

**Uppaal ETL transformation with the Uppaal Code Syntax library**

``` javascript
    // Transformation for: areCoordinatesValid = x == 25 and y > 100;
    var statement = assign("areCoordinatesValid", and_(equal("x", "25"), greater("y", "100")));
```

## Logical expressions
### and_

Use `and_` to create a logical AND expression.
The resulting expression evaluates to true only when both operands evaluate to true.

Signature:
`and_(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!LogicalExpression`

Examples:
``` javascript
    // conditionA and conditionB
    and_("conditionA", "conditionB");

    // valueA == 25 and conditionB
    and_(equal("valueA", "25"), "conditionB");

    // conditionA and valueB > 100
    and_("conditionA", greater("valueB", "100"));

    // valueA == 25 and valueB > 100
    and_(equal("valueA", "25"), greater("valueB", "100"));
```

### or_

Use `or_` to create a logical OR expression.
The resulting expression evaluates to true when at least one operand evaluates to true.

Signature:
`or_(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!LogicalExpression`

Examples:
``` javascript
    // conditionA or conditionB
    or_("conditionA", "conditionB");

    // valueA == 25 or conditionB
    or_(equal("valueA", "25"), "conditionB");

    // conditionA or valueB > 100
    or_("conditionA", greater("valueB", "100"));

    // valueA == 25 or valueB > 100
    or_(equal("valueA", "25"), greater("valueB", "100"));
```

## Arithmetic expressions
### add

Use `add` to create an arithmetic addition (`+`) expression.
The resulting expression adds two values together.

Signature:
`add(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!ArithmeticExpression`

Examples:
``` javascript
    // valueA + valueB
    add("valueA", "valueB");

    // (valueA - 25) + valueB
    add(subtract("valueA", "25"), "valueB");

    // valueA + (valueB - 100)
    add("valueA", subtract("valueB", "100"));

    // (valueA - 25) + (valueB - 100)
    add(subtract("valueA", "25"), subtract("valueB", "100"));
```

### subtract

Use `subtract` to create an arithmetic subtraction (`-`) expression.
The resulting expression subtracts the second value from the first value.

Signature:
`subtract(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!ArithmeticExpression`

Examples:
``` javascript
    // valueA - valueB
    subtract("valueA", "valueB");

    // (valueA + 25) - valueB
    subtract(add("valueA", "25"), "valueB");

    // valueA - (valueB + 100)
    subtract("valueA", add("valueB", "100"));

    // (valueA + 25) - (valueB + 100)
    subtract(add("valueA", "25"), add("valueB", "100"));
```

### divide

Use `divide` to create an arithmetic division (`/`) expression.
The resulting expression divides the first value by the second value.

Signature:
`divide(first: String, second: String | Uppaal!Expression)`

Parameters:
- `first`: The numerator, provided as a `String`.
- `second`: The denominator, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!ArithmeticExpression`

Examples:
``` javascript
    // valueA / valueB
    divide("valueA", "valueB");

    // valueA / (valueB + 100)
    divide("valueA", add("valueB", "100"));

    // 1000 / divisor
    divide("1000", "divisor");
```

### multiplicate

Use `multiplicate` to create an arithmetic multiplication (`*`) expression.
The resulting expression multiplies two values.

Signature:
`multiplicate(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!ArithmeticExpression`

Examples:
``` javascript
    // valueA * valueB
    multiplicate("valueA", "valueB");

    // valueA * (valueB + 10)
    multiplicate("valueA", add("valueB", "10"));

    // (valueA - 1) * valueB
    multiplicate(subtract("valueA", "1"), "valueB");

    // factor * input
    multiplicate("factor", "input");
```

### modulo

Use `modulo` to create an arithmetic modulo (`%`) expression.
The resulting expression returns the remainder of dividing the first value by the second value.

Signature:
`modulo(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!ArithmeticExpression`

Examples:
``` javascript
    // valueA % valueB
    modulo("valueA", "valueB");

    // valueA % (valueB + 10)
    modulo("valueA", add("valueB", "10"));

    // (valueA + 100) % valueB
    modulo(add("valueA", "100"), "valueB");

    // (valueA + 100) % (valueB + 10)
    modulo(add("valueA", "100"), add("valueB", "10"));
```

## Compare expressions
### greaterOrEqual

Use `greaterOrEqual` to create a greater-than-or-equal (`>=`) comparison expression.
The resulting expression is true when the first value is greater than or equal to the second value.

Signature:
`greaterOrEqual(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA >= valueB
    greaterOrEqual("valueA", "valueB");

    // (valueA + 10) >= threshold
    greaterOrEqual(add("valueA", "10"), "threshold");

    // valueA >= (valueB - 2)
    greaterOrEqual("valueA", subtract("valueB", "2"));

    // (valueA + 10) >= (valueB - 2)
    greaterOrEqual(add("valueA", "10"), subtract("valueB", "2"));
```

### equal

Use `equal` to create an equality (`==`) comparison expression.
The resulting expression is true when both values are equal.

Signature:
`equal(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA == valueB
    equal("valueA", "valueB");

    // (valueA + 10) == target
    equal(add("valueA", "10"), "target");

    // valueA == (valueB - 2)
    equal("valueA", subtract("valueB", "2"));
```

### greater

Use `greater` to create a greater-than (`>`) comparison expression.
The resulting expression is true when the first value is greater than the second value.

Signature:
`greater(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA > valueB
    greater("valueA", "valueB");

    // (valueA + 10) > limit
    greater(add("valueA", "10"), "limit");

    // valueA > (valueB - 2)
    greater("valueA", subtract("valueB", "2"));

    // (valueA + 10) > (valueB - 2)
    greater(add("valueA", "10"), subtract("valueB", "2"));
```

### less

Use `less` to create a less-than (`<`) comparison expression.
The resulting expression is true when the first value is less than the second value.

Signature:
`less(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA < valueB
    less("valueA", "valueB");

    // (valueA - 5) < threshold
    less(subtract("valueA", "5"), "threshold");

    // valueA < (valueB + 2)
    less("valueA", add("valueB", "2"));

    // (valueA - 5) < (valueB + 2)
    less(subtract("valueA", "5"), add("valueB", "2"));
```

### lessOrEqual

Use `lessOrEqual` to create a less-than-or-equal (`<=`) comparison expression.
The resulting expression is true when the first value is less than or equal to the second value.

Signature:
`lessOrEqual(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA <= valueB
    lessOrEqual("valueA", "valueB");

    // (valueA + 10) <= limit
    lessOrEqual(add("valueA", "10"), "limit");

    // valueA <= (valueB - 2)
    lessOrEqual("valueA", subtract("valueB", "2"));
```

### not_

Use `not_` to create an inequality (`!=`) comparison expression.
The resulting expression is true when the two values are different.

Signature:
`not_(first: String | Uppaal!Expression, second: String | Uppaal!Expression)`

Parameters:
- `first`: The left operand, provided either as a `String` or as an existing `Uppaal!Expression`.
- `second`: The right operand, provided either as a `String` or as an existing `Uppaal!Expression`.

Returns:
`Uppaal!CompareExpression`

Examples:
``` javascript
    // valueA != valueB
    not_("valueA", "valueB");

    // status != expectedStatus
    not_("status", "expectedStatus");

    // valueA != (valueB + 1)
    not_("valueA", add("valueB", "1"));

    // (valueA - 1) != (valueB + 1)
    not_(subtract("valueA", "1"), add("valueB", "1"));
```

## Function call expressions
### functionCall

Use `functionCall` to create a function call expression.
You can call a function with no arguments, or with an argument sequence.
The resulting expression represents a function invocation with resolved function reference and provided arguments.

Signature:
`functionCall(name: String, arguments: Sequence)`
`functionCall(name: String)`

Parameters:
- `name`: The function name.
- `arguments`: Optional sequence of arguments. Each argument can be a `String` or a `Uppaal!Expression`.

Returns:
`Uppaal!FunctionCallExpression`

Examples:
``` javascript
    // update()
    functionCall("update");

    // setValues(valueA, valueB)
    functionCall("setValues", Sequence { "valueA", "valueB" });

    // process(valueA, valueB + 1)
    functionCall("process", Sequence { "valueA", add("valueB", "1") });
```

## Increment/decrement expressions
### increment

Use `increment` to create a post-increment (`++`) expression.
The resulting expression increments the provided variable by 1 as a post-increment operation.

Signature:
`increment(variable: Uppaal!Variable)`

Parameters:
- `variable`: The variable to increment.

Returns:
`Uppaal!IncrementDecrementExpression`

Examples:
``` javascript
    // counter++
    increment(counter);

    // index++
    increment(index);
```

### preIncrement

Use `preIncrement` to create a pre-increment (`++`) expression.
The resulting expression increments the provided variable by 1 as a pre-increment operation.

Signature:
`preIncrement(variable: Uppaal!Variable)`

Parameters:
- `variable`: The variable to increment.

Returns:
`Uppaal!IncrementDecrementExpression`

Examples:
``` javascript
    // ++counter
    preIncrement(counter);

    // ++index
    preIncrement(index);
```

### decrement

Use `decrement` to create a post-decrement (`--`) expression.
The resulting expression decrements the provided variable by 1 as a post-decrement operation.

Signature:
`decrement(variable: Uppaal!Variable)`

Parameters:
- `variable`: The variable to decrement.

Returns:
`Uppaal!IncrementDecrementExpression`

Examples:
``` javascript
    // counter--
    decrement(counter);

    // index--
    decrement(index);
```

### preDecrement

Use `preDecrement` to create a pre-decrement (`--`) expression.
The resulting expression decrements the provided variable by 1 as a pre-decrement operation.

Signature:
`preDecrement(variable: Uppaal!Variable)`

Parameters:
- `variable`: The variable to decrement.

Returns:
`Uppaal!IncrementDecrementExpression`

Examples:
``` javascript
    // --counter
    preDecrement(coutner);

    // --index
    preDecrement(index);
```

## Unary expressions
### minus

Use `minus` to create a unary minus (`-`) expression.
The resulting expression negates the provided value.

Signature:
`minus(literal: String)`
`minus(expression: Uppaal!Expression)`

Parameters:
- `literal`: The value to negate as a `String`.
- `expression`: The expression to negate as an existing `Uppaal!Expression`.

Returns:
`Uppaal!MinusExpression`

Examples:
``` javascript
    // -valueA
    minus("valueA");

    // -(valueA + 1)
    minus(add("valueA", "1"));
```

### not_

Use `not_` to create a unary logical negation (`not`) expression.
The resulting expression negates the provided condition, returning true only when the condition is false.

Signature:
`not_(literal: String)`
`not_(expression: Uppaal!Expression)`

Parameters:
- `literal`: The condition to negate as a `String`.
- `expression`: The expression to negate as an existing `Uppaal!Expression`.

Returns:
`Uppaal!NegationExpression`

Examples:
``` javascript
    // not conditionA
    not_("conditionA");

    // not (valueA == 25)
    not_(equal("valueA", "25"));

    // not (valueA > 100)
    not_(greater("valueA", "100"));

    // not ((valueA == 25) and (valueB > 100))
    not_(and_(equal("valueA", "25"), greater("valueB", "100")));
```