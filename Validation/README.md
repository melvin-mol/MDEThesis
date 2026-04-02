# Validation Artifacts

This directory contains the reproducible artifacts used to validate behavioral equivalence for RQ4 in the thesis.

## Contents

- `Dataset/`: Validation corpus with 21 model-transformation pairs (7 biological models x 3 transformation variants), plus the original input models used to generate those outputs.
- `compare-equivalence.js`: Node.js script that compares paired `Old.xml` and `New.xml` outputs and reports equivalence results in the terminal.

## Dataset Structure

`Dataset/` is organized as:

- One folder per biological model
- Within each biological-model folder:
  - the original ANIMO input model file, typically a `.cys` file
  - one folder per transformation variant
- Within each variant folder:
  - `Old.xml`: legacy ANIMO output
  - `New.xml`: thesis implementation output

## Input Model Source

The input models in this dataset were taken from the official ANIMO models page, which publishes ANIMO models used in published papers:

- [ANIMO models page](https://sschivo.github.io/ANIMO_website/models.html)

The validation dataset uses the following input model cases from that source:

- `BIBE2012 - MAPK`
- `BMC2016 - Model_Drosophila_circadian_clock_final`
- `ECHO_SOX9_to_RUNX2`
- `Gene2014 - Base`
- `IEEE2013 - A_B_kinetics`
- `Manual - Example ABCD`
- `SynCoP2014 - Model_base`

## Requirements

- Node.js installed

## Run The Validation

From this `Validation/` directory, run:

```bash
node compare-equivalence.js
```

## Expected Success Result

A successful full run reports output like the following.

<pre>
<b>- BIBE2012 - MAPK: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- BMC2016 - Model_Drosophila_circadian_clock_final: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- ECHO_SOX9_to_RUNX2: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- Gene2014 - Base: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- IEEE2013 - A_B_kinetics: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- Manual - Example ABCD: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>
<b>- SynCoP2014 - Model_base: <span style="color:#2ea043;">All passed</span></b>
  --- Ordinary Differential Equations (ODEs): <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model: <span style="color:#2ea043;">Passed</span>
  --- Reactant-centered model simplified: <span style="color:#2ea043;">Passed</span>

Checked pairs: 21
<span style="color:#2ea043;">Passed: 21</span>
<span style="color:#cf222e;">Failed: 0</span>
</pre>

## Ignored Differences and Research-Method Traceability

The checker is intentionally strict: all differences fail unless they are explicitly allowed by the RQ4 behavioral-equivalence protocol.

### General protocol allowances

The following differences are ignored because the research method classifies them as behavior-preserving:

- comments
- whitespace
- equivalent operator spellings and escapes, such as `&&` / `and`, `||` / `or`, and `!` / `not`
- parentheses or braces that do not change behavior
- equivalent increment forms, such as `x++` and `x = x + 1`
- `:=` versus `=` when semantically equivalent
- a trailing `: false` in a `simulate` query when no explicit simulation goal is provided and the rest of the query is identical
- different location identifiers when source/target references remain internally consistent
- absent versus present-but-empty `assignment` or `select` labels
- equivalent location id/name combinations
- different `<label>` order within the same `<transition>`
- a missing `<name>` element when its implied name is unchanged

### Additional allowances for the non-simplified reactant-centered model

The research method documents a small set of extra allowed differences only for the non-simplified deterministic variant:

- `round` replaced by `_ANIMO_round`
- presence of the helper `divide(...)` function required by `_ANIMO_round`
- `TL` / `TU` written as `tL` / `tU`
- presence of the `int_t` type declaration required by `_ANIMO_round`
- `<declaration>` absent in one file and present-but-empty in the other
