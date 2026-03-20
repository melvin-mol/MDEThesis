# Case Study

This directory contains the case study for the Master's thesis **"Improving ANIMO's Extensibility through Model-Driven Engineering."** It contains three ANIMO-to-Uppaal ETL transformations that were re-implemented using the new framework introduced in the thesis. All transformations use the [Uppaal Code Syntax](../Uppaal%20Code%20Syntax/) shared library and follow the project directory structure proposed in the thesis (described below).

## Models

### ODE

An ANIMO-to-Uppaal transformation that generates an ODE (Ordinary Differential Equation) based Uppaal model.

**Location:** `transformations/models/ODE/`

### VariablesModelReactantCenteredDeterministic\_simplified

A simplified ANIMO-to-Uppaal transformation that generates a variables model using a reactant-centered, deterministic approach.

**Location:** `transformations/models/VariablesModelReactantCenteredDeterministic_simplified/`

### VariablesModelReactantCenteredDeterministic

The reactant-centered deterministic transformation. It **inherits** from `VariablesModelReactantCenteredDeterministic_simplified` and overrides only the parts that differ, demonstrating the ETL inheritance approach described in the thesis. This keeps the two transformations DRY: shared logic lives in the simplified version and the non-simplified version only adds or replaces what is different.

**Location:** `transformations/models/VariablesModelReactantCenteredDeterministic/`

## Uppaal Code Syntax

All three transformations use the [Uppaal Code Syntax](../Uppaal%20Code%20Syntax/) library. It is included via the shared libraries entry point:

```
transformations/shared libraries/Shared Libraries.etl
```

Each top-level transformation file imports that entry point, which transitively pulls in the Uppaal Code Syntax helpers (e.g. `assign`, `edge`, `location`, `guard_`, etc.), removing the need to build the Uppaal AST node by node.

## Directory Structure

The thesis proposes a standardized project directory structure to keep transformations consistent and maintainable. Each model in this case study follows that structure:

```
exampleModel/
|-- globalDeclarations/
|   |-- functions/
|   |-- types/
|   |-- variables/
|   `-- GlobalDeclarations.etl
|-- template/
|   `-- firstTemplate/
|       |-- localDeclarations/
|       |   |-- functions/
|       |   |-- types/
|       |   |-- variables/
|       |   `-- LocalDeclarations.etl
|       |-- edges/
|       |   `-- Edges.etl
|       |-- locations/
|       |   `-- Locations.etl
|       `-- Template.etl
|-- system/
|   |-- instantiationList/
|   `-- System.etl
|-- Transformation.etl
`-- ExampleModel.etl
```

The rationale behind this structure:

- **`globalDeclarations/`** — separates global functions, types, and variables into their own sub-folders so each concern can be found and modified independently.
- **`template/`** — contains one sub-folder per Uppaal template. Each template sub-folder further separates local declarations, edge definitions, and location definitions.
- **`system/`** — holds the system declaration and the instantiation list, keeping system-level composition separate from template logic.
- **`Transformation.etl`** — the single entry point that wires all sub-modules together and defines the top-level `transformation` operation.
- **`ExampleModel.etl`** — the root import file that exposes the transformation to the outside (equivalent to `Animo2ODE.etl`, `Animo2VariablesModelReactantCenteredDeterministic.etl`, etc. in this case study).

## Metamodels

The metamodels used by the transformations are located in `metamodels/`:

| File | Description |
|------|-------------|
| `animo.ecore` / `animo.emf` | The ANIMO source metamodel |
| `uppaal.ecore` / `uppaal.emf` | The extended Uppaal target metamodel (from [UppaalEMF Extension](../UppaalEMF%20Extension/)) |
| `uppaalSMC.ecore` | The extended Uppaal SMC variant of the target metamodel |
