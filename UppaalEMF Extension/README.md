# Extended UppaalEMF project
 
The extended UppaalEMF project addresses several shortcomings in the original [UppaalEMF project](https://github.com/utwente-fmt/attop/tree/master/UppaalEMF). The extension includes the following improvements.

**New features**

- Changed transition guards to standalone objects, enabling their position (x, y) to be set.
- Added the ability to set the position (x, y) of transition selection labels.
- Changed transition assignments to standalone objects, enabling their position (x, y) to be set.
- Added the ability to set the position (x, y) of transition synchronization labels.
- Added the ability to set the position (x, y) of transition names.
- Added the ability to set the position (x, y) of location names.
- Changed location invariants to standalone objects, enabling their position (x, y) to be set.

**Fixed bugs**

- Fixed a NullPointerException thrown by `RangeTypeSpecification`.