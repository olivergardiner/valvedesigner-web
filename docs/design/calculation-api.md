# Circuit calculation API

All eight circuit pages use browser-independent functions in `public/calculations/`. Functions accept a constructed Device and named parameters, return plain data, and do not mutate their inputs. They use model/numerical APIs from designer.js and sampling from curves.js, with no DOM, jQuery or Chart.js calls.

## Files and functions

| File | Responsibility |
| --- | --- |
| common.js | Input/device checks, finite-result checks, checked intersections, cathode-bias sampling and curve-derived gain |
| triodecc.js | calculateTriodeCC |
| pentodecc.js | calculatePentodeCC, retaining the legacy two-pass approximation |
| followers.js | calculateACCathodeFollower and calculateDCCathodeFollower |
| outputstage.js | calculateOutputStage, shared by four transformer variants |

## Inputs

| Function | Parameter keys |
| --- | --- |
| calculateTriodeCC / calculateDCCathodeFollower | supplyVoltage, cathodeResistance, anodeResistance, loadResistance |
| calculatePentodeCC | supplyVoltage, cathodeResistance, anodeResistance, screenResistance, loadResistance |
| calculateACCathodeFollower | supplyVoltage, biasResistance, cathodeResistance, loadResistance |
| calculateOutputStage | supplyVoltage, anodeBiasCurrent, loadResistance, plus screenVoltage or screenTap |

calculateOutputStage also accepts options with pushPull and ultralinear booleans. loadResistance means single-ended load or push-pull anode-to-anode load. Screen tap is a fraction from 0 to 1 inclusive. Circuit voltages, resistances and target current must otherwise be finite and positive. Sweep limits/step must be finite and positive, with at most 10000 grid intervals including the doubled ultralinear range. These checks establish a numerical domain, not compliance with every valve rating.

## Results and units

Results contain operatingPoint, topology-specific derived values (gain, transconductance, outputImpedance, cathodeResistance or outputPower), and curves. curves.characteristics is an array of point arrays; curves.dissipation is a point array. Other keys identify anode/cathode/AC/follower load lines. The DC follower also returns followerOperatingPoint with the original second-marker coordinates and voltage approximation, rather than a new independent valve solve.

Voltages are V, plotted/operating currents mA, resistances ohms, transconductance mA/V and power W. Model current calls still return A. Output-stage cathode current is per valve; push-pull cathodeResistance is the shared resistor value.

Common domain/numerical failures throw CircuitCalculationError, a RangeError. Missing intersections and non-finite results are rejected. The inverse methods still lack convergence status, and output bias selection remains a nearest-candidate search without a new residual-acceptance policy. Successful-case equations, sampling and approximations are preserved; regression equivalence does not independently establish physical accuracy.

## Compatibility adapters and loading

The retired CalculatedCircuit in public/calculatedcircuit.js maps ordered UI fields through parameterKeys, formats named outputPaths and constructs datasets from resultSeries metadata. Labels, colours and display formatting belong here or in the page adapters. Expected failures clear the old chart/result and show an alert; corrected input restores rendering. TransformerOutputCircuit shares field and presentation metadata for the four output pages. Numerical variation is composed through calculateOutputStage options, not solver subclasses.

The shared designer loads all calculation functions before circuit-definitions.js and designer-workspace.js. DesignerSession converts displayed units, constructs a cloned Device and calls the selected function. Retired adapters remain available only to regression tests; original HTML URLs redirect to shared routes. Viewer and modellers retain their previous dependency sets.

Run the three regression scripts documented in [development.md](development.md) when changing this interface.
