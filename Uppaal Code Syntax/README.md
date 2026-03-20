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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
- `functionCall(name: String, arguments: Sequence)` — Call function with arguments
- `functionCall(name: String)` — Call function without arguments

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

Signatures:
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

Signatures:
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

Signatures:
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

Signatures:
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

## Minus expressions
### minus

Use `minus` to create a unary minus (`-`) expression.
The resulting expression negates the provided value.

Signatures:
- `minus(text: String)` — Negate a string literal
- `minus(expression: Uppaal!Expression)` — Negate an expression

Parameters:
- `text`: The value to negate as a `String`.
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

Signatures:
- `not_(text: String)` — Negate a string literal
- `not_(expression: Uppaal!Expression)` — Negate an expression

Parameters:
- `text`: The condition to negate as a `String`.
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

## Channel variable declarations
### channelVariableDeclaration

Use `channelVariableDeclaration` to create a channel variable declaration.
The resulting declaration declares one or more variables as communication channels, optionally marked as broadcast channels.

Signatures:
- `channelVariableDeclaration(broadcast: Boolean, type: String, variable: Uppaal!Variable)` — Declare single channel
- `channelVariableDeclaration(broadcast: Boolean, type: String, variables: Sequence(Uppaal!Variable))` — Declare multiple channels

Parameters:
- `broadcast`: Whether the channel is a broadcast channel. Set to `true` for broadcast channels, `false` for regular channels.
- `type`: The predefined type name, typically `"chan"` for channels.
- `variable`: A single variable to declare as a channel.
- `variables`: A sequence of variables to declare together as channels.

Returns:
`Uppaal!ChannelVariableDeclaration`

Examples:
``` javascript
    // chan request;
    channelVariableDeclaration(false, "chan", request);

    // broadcast chan signal;
    channelVariableDeclaration(true, "chan", signal);

    // chan send, receive;
    channelVariableDeclaration(false, "chan", Sequence { send, receive });

    // broadcast chan eventOne, eventTwo;
    channelVariableDeclaration(true, "chan", Sequence { eventOne, eventTwo });
```

## Clock variable declarations
## clock

Use `clock` to create a clock variable declaration.
The resulting declaration creates a single clock variable with the predefined clock type.

Signatures:
`clock(name: String)`

Parameters:
- `name`: The name of the clock variable to declare.

Returns:
`Uppaal!ClockVariableDeclaration`

Examples:
``` javascript
    // clock x;
    clock("x");

    // clock timer;
    clock("timer");

    // clock t1;
    clock("t1");
```

## Data variable declarations
### dataVariableDeclaration

Use `dataVariableDeclaration` to create a data variable declaration with optional prefix and initializer.
The resulting declaration declares one or more variables with a specified type, optionally marked with a prefix (CONST or META) and initialized with a value.

Signatures:

**With prefix (CONST/META):**
- `dataVariableDeclaration(prefix: String, type: String, name: String, value: String)` — Single variable with String type
- `dataVariableDeclaration(prefix: String, type: Uppaal!Type, name: String, value: String)` — Single variable with Uppaal!Type
- `dataVariableDeclaration(prefix: String, type: Uppaal!Type, variables: Sequence(Uppaal!Variable))` — Multiple variables

**Without prefix:**
- `dataVariableDeclaration(type: String, name: String, value: String)` — Single variable with String type and initializer
- `dataVariableDeclaration(type: Uppaal!Type, name: String)` — Single variable without initializer
- `dataVariableDeclaration(type: Uppaal!Type, name: String, value: String)` — Single variable with initializer
- `dataVariableDeclaration(type: Uppaal!Type, variableNames: Sequence(String))` — Multiple variables by names

Parameters:
- `prefix`: Optional prefix, either `"CONST"` for constant variables or `"META"` for metadata variables.
- `type`: The data type as a `String` (predefined type name) or as an `Uppaal!Type`.
- `name`: The name of the variable to declare.
- `variables`: A sequence of variables to declare together.
- `variableNames`: A sequence of variable names to declare together.
- `value`: Optional initializer value as a `String`.

Returns:
`Uppaal!DataVariableDeclaration`

Examples:
``` javascript
    // int x = 5;
    dataVariableDeclaration("int", "x", "5");

    // const int MAX = 100;
    dataVariableDeclaration("CONST", "int", "MAX", "100");

    // custom_type a, b, c;
    dataVariableDeclaration(customType, Sequence { "a", "b", "c" });

    // meta bool flag = false;
    dataVariableDeclaration("META", "bool", "flag", "false");

    // double value;
    dataVariableDeclaration(doubleType, "value");
```

## Function declarations
### function_

Use `function_` to create a function declaration with an optional parameter list.
The resulting declaration creates a function with a specified return type and name, optionally with parameters.
This operation returns a tuple containing both the declaration and the function block, allowing statements to be added to the function body.

Signatures:

**With parameters:**
- `function_(type: Uppaal!Type, name: String, parameters: Sequence(Uppaal!Parameter))` — Function with Uppaal!Type return type
- `function_(type: String, name: String, parameters: Sequence(Uppaal!Parameter))` — Function with String return type

**Without parameters:**
- `function_(type: Uppaal!Type, name: String)` — Function with Uppaal!Type return type, no parameters
- `function_(type: String, name: String)` — Function with String return type, no parameters

Parameters:
- `type`: The return type as an `Uppaal!Type` or as a `String` (predefined type name).
- `name`: The name of the function to declare.
- `parameters`: Optional sequence of function parameters.

Returns:
`Tuple` with:
- `declaration`: The `Uppaal!FunctionDeclaration`
- `block`: The `Uppaal!Block` where statements can be added to the function body

Examples:
``` javascript
    // int add(int a, int b) { }
    var func = function_("int", "add", Sequence { paramA, paramB });

    // void update() { }
    var func = function_("void", "update");

    // custom_type isValid(bool condition) { }
    var func = function_(customType, "isValid", Sequence { conditionParam });

    // double calculate() { }
    var func = function_(doubleType, "calculate");
    // func.block can now be used to add statements to the function body
```

## Parameter declarations
### parameter

Use `parameter` to create a function parameter declaration.
The resulting parameter declares a typed parameter that can be used in a function signature.
Parameters can optionally include a prefix (CONST or META).

Signatures:

**Basic parameters:**
- `parameter(type: Uppaal!Type, name: String)` — Parameter with Uppaal!Type
- `parameter(type: String, name: String)` — Parameter with String type

**With prefix:**
- `parameter(prefix: String, type: String, name: String)` — Parameter with CONST or META prefix

Parameters:
- `type`: The parameter type as an `Uppaal!Type` or as a `String` (predefined type name).
- `name`: The name of the parameter.
- `prefix`: Optional prefix, either `"CONST"` for constant parameters or `"META"` for metadata parameters.

Returns:
`Uppaal!Parameter`

Examples:
``` javascript
    // int x
    parameter("int", "x");

    // double value
    parameter(doubleType, "value");

    // const int MAX
    parameter("CONST", "int", "MAX");

    // Sequence of parameters for use in function_()
    var params = Sequence { parameter("int", "a"), parameter("int", "b") };
    
    // void add(int a, int b) {}
    function_("int", "add", params);
```

### parameterCallByReference

Use `parameterCallByReference` to create a call-by-reference function parameter declaration.
The resulting parameter passes its value by reference, meaning changes made inside the function affect the original variable.

Signatures:
`parameterCallByReference(type: String, name: String)`

Parameters:
- `type`: The parameter type as a `String` (predefined type name).
- `name`: The name of the parameter.

Returns:
`Uppaal!Parameter`

Examples:
``` javascript
    // int& reference
    parameterCallByReference("int", "reference");

    // Sequence of parameters combining value and reference parameters
    var params = Sequence { parameter("int", "a"), parameterCallByReference("int", "b") };
    
    // void swap(int a, int& b) {}
    function_("void", "swap", params);
```

## Type declarations
### rangeTypeDeclaration

Use `rangeTypeDeclaration` to create a range type declaration.
The resulting declaration defines a named integer type constrained to a specific range between a lower and upper bound.

Signatures:
`rangeTypeDeclaration(lowerBound: String, upperBound: String, name: String)`

Parameters:
- `lowerBound`: The lower bound of the range as a `String`.
- `upperBound`: The upper bound of the range as a `String`.
- `name`: The name of the type to declare.

Returns:
`Uppaal!TypeDeclaration`

Examples:
``` javascript
    // typedef int[0, 10] rangedInt;
    rangeTypeDeclaration("0", "10", "rangedInt");

    // typedef int[MIN, MAX] bounded;
    rangeTypeDeclaration("MIN", "MAX", "bounded");

    // typedef int[0, N-1] index;
    rangeTypeDeclaration("0", "N-1", "index");
```

### structTypeDeclaration

Use `structTypeDeclaration` to create a struct type declaration.
The resulting declaration defines a named struct type containing the provided data variable declarations as fields.

Signatures:
`structTypeDeclaration(variableDeclarations: Sequence(Uppaal!DataVariableDeclaration), name: String)`

Parameters:
- `variableDeclarations`: A sequence of data variable declarations that form the struct fields.
- `name`: The name of the struct type to declare.

Returns:
`Uppaal!TypeDeclaration`

Examples:
``` javascript
    // typedef struct { int x; int y; } Point;
    var fields = Sequence {
        dataVariableDeclaration(intType, "x"),
        dataVariableDeclaration(intType, "y")
    };
    structTypeDeclaration(fields, "Point");

    // typedef struct { bool active; int count; } State;
    var fields = Sequence {
        dataVariableDeclaration(boolType, "active"),
        dataVariableDeclaration(intType, "count")
    };
    structTypeDeclaration(fields, "State");
```

## Variables
### variable

Use `variable` to create a variable with an optional initial value.
The resulting variable can be used in declarations such as `dataVariableDeclaration` or `channelVariableDeclaration`.

Signatures:
- `variable(name: String)` — Variable without initializer
- `variable(name: String, value: String)` — Variable with initializer

Parameters:
- `name`: The name of the variable.
- `value`: Optional initial value as a `String`.

Returns:
`Uppaal!Variable`

Examples:
``` javascript
    // x
    variable("x");

    // count = 0
    variable("count", "0");

    // flag = false
    variable("flag", "false");
```

### variableList

Use `variableList` to create a variable declaration for an array variable, where the array size is defined by an existing variable.
The resulting variable uses the provided size variable as its index and sets an initial value.

Signatures:
`variableList(name: String, sizeVariable: Uppaal!Variable, value: String)`

Parameters:
- `name`: The name of the variable to declare.
- `sizeVariable`: An `Uppaal!Variable` used as the size expression for the array index.
- `value`: The initial value for the variable as a `String`.

Returns:
`Uppaal!Variable`

Examples:
``` javascript
    // items[N] = 0
    variableList("items", n, "0");

    // slots[capacity] = -1
    variableList("slots", capacity, "-1");
```

### findVariable

Use `findVariable` to look up an existing variable by name from a `Uppaal!GlobalDeclarations` object.
The resulting variable can be passed to other operations that require an `Uppaal!Variable`.

Signatures:
`globalDeclarations.findVariable(varName: String)`

Parameters:
- `varName`: The name of the variable to find.

Returns:
`Uppaal!Variable`

Examples:
``` javascript
    // Find a variable named "count" from global declarations
    var count = globalDeclarations.findVariable("count");

    // Use found variable in another operation
    increment(globalDeclarations.findVariable("index"));
```

### getField

Use `getField` to retrieve a specific field variable from a struct type.
The resulting variable is the field with the given name inside the struct type definition.

Signatures:
`getField(type: Uppaal!DeclaredType, fieldName: String)`

Parameters:
- `type`: The `Uppaal!DeclaredType` referencing the struct type.
- `fieldName`: The name of the field to retrieve.

Returns:
`Uppaal!Variable`

Examples:
``` javascript
    // Get the "x" field from a Point struct type
    var xField = getField(pointType, "x");

    // Get the "count" field from a State struct type
    var countField = getField(stateType, "count");
```