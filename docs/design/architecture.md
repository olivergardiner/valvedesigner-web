# Architecture

## Runtime

The suite uses classic scripts and static HTML pages. The new shared designer uses native DOM event listeners; ToolsWorkspace also uses native event listeners around the existing viewer/modeller adapters. There is no backend, bundler, module loader or persistent application store. Charts load Chart.js from an unversioned jsDelivr npm URL. Viewer/modeller pages also load jQuery 3.7.1 from code.jquery.com, shared scripts and their tool/catalogue scripts; the former calculator menu remains only as historical compatibility code. The new workspace uses its own metadata/controller and native DOM listeners instead of jQuery. Eclipse metadata is present but is not a JavaScript build system.

`public/designer.html` is now the shared designer, hosting all eight circuit calculators. The `#circuits` route provides the complete calculator directory. `public/index.html` redirects correctly to designer.html. All original calculator URLs redirect to the matching hash route. See [shared-designer.md](shared-designer.md).

## Responsibilities and lifecycle

| Component | Responsibility |
| --- | --- |
| Circuit in designer.js | DOM parameter binding, device loading, dataset lifecycle and Chart.js rendering |
| Device | Dispatch on definition.model.device and definition.model.type |
| Model subclasses | Forward current equations and shared inverse searches |
| Functions in calculations/ | Topology calculations and plain result/curve arrays |
| DesignerWorkspace / DesignerSession | Metadata-generated controls, per-circuit raw edits, named result rendering, chart lifecycle and errors |
| CalculatedCircuit | Retired numbered-field compatibility adapter used by regression checks |
| Circuit subclasses | Page field and presentation metadata |
| Characteristics | Curve generation and synthetic Valve Workbench export |
| Modeller subclasses | Slider mapping, reference-point normalisation, image overlay and JSON display |
| HTML pages | DOM contract, script ordering, device lists, construction and events |

DesignerWorkspace and ToolsWorkspace initialise their respective pages. ToolsWorkspace builds the adapters’ numbered fields and overrides chart rendering; the modeller equations and export methods remain in their original classes. `loadDevice(list, index)` uses structuredClone, constructs Device, calls onDeviceLoad() and redraws. `loadSingleDevice(definition)` retains the supplied definition without cloning. The model holds a reference to the selected definition's model object, so slider edits immediately affect evaluations without modifying the source catalogue.

`showPlots()` destroys previous charts, clears dataset arrays, then calls loadLines(), anodePlot(), anodePowerPlot() and drawChart(), in that order. Characteristic plotting can depend on operating-point state computed first. Main chart datasets combine operating points, dissipation limits and anode curves. The characteristics viewer supplies a second canvas for fixed-screen pentode and screen-current curves.

All eight circuit calculators now delegate to browser-independent functions in public/calculations/. They accept a Device plus named parameters and return named operating-point/derived values and plain curves. They do not mutate their inputs or call DOM/Chart.js APIs. DesignerWorkspace maps those results to the shared fields and charts. Four transformer output variants share one calculation and TransformerOutputCircuit presentation metadata. Models and numerical APIs remain in designer.js. There is no separate simulation controller or document model. See [calculation-api.md](calculation-api.md).

## Circuit inventory

| Script / class | Valve list | Role |
| --- | --- | --- |
| triodecc.js / TriodeCC | smallSignalTriodes | Common cathode |
| pentodecc.js / PentodeCC | smallSignalPentodes | Common cathode with screen resistor |
| accathodefollower.js / ACCathodeFollower | smallSignalTriodes | AC coupled follower |
| dccathodefollower.js / DCCathodeFollower | smallSignalTriodes | Driver and directly coupled follower |
| singleended.js / SingleEnded | powerPentodes + powerTriodes | Fixed-screen transformer output |
| singleended-ul.js / SingleEndedUL | powerPentodes | Ultralinear single-ended output |
| pushpull.js / PushPull | powerPentodes + powerTriodes | Push-pull output |
| pushpull-ul.js / PushPullUL | powerPentodes | Ultralinear push-pull output |

powerTriodes is currently empty. Characteristics combines small-signal triodes, small-signal pentodes and power pentodes. Modellers use separate triodes/pentodes template arrays. Long-tailed-pair and cathodyne phase splitters are placeholders on the landing page.

## Assets and state

SVG drawings live in svg/; calculator pages display corresponding public PNGs. Users explicitly select datasheet images, read locally as data URLs by FileReader and drawn into the chart plotting area by an overlay plugin. No automatic curve-image catalogue, circuit save/load, model JSON import or reload persistence exists.

## Shared sampling and presentation

All tool pages now load curves.js and plotting.js before designer.js, preserving classic-script globals. curves.js produces plain data: voltage samples, grid families, anode-current curves, load lines and dissipation curves. Anode sampling accepts a constant screen voltage or a voltage callback for ultralinear stages. The pure triode calculation uses this layer without invoking presentation helpers.

plotting.js owns line/point/dissipation datasets and the common Chart.js configuration used by both characteristic charts. Circuit delegates point/load-line creation and offers addDissipationCurve; individual tools still decide which overlays to show. The viewer continues to omit a dissipation overlay. Calculation functions retain topology-specific load-line equations; adapters perform field updates. Modellers retain coefficient updates; ToolsWorkspace owns responsive image alignment; their sampling and dissipation presentation use the shared helpers.

Sampling explicitly distinguishes a synthetic origin from an evaluated zero-voltage point, and a 100-point sweep omitting zero from the standard 101-point sweep. Grid values still advance by repeated addition, retaining the existing endpoint tolerance. Dissipation uses 100 points and excludes its upper voltage endpoint, as before. Export metadata and known numerical approximations are unchanged.


The shared page uses circuit-definitions.js for all eight circuits’ fields, result paths, default values, schematic and help. It calls the same pure calculation function directly through DesignerSession; it does not bind numbered legacy field slots or require jQuery. The retired numbered-field adapter scripts are no longer loaded by production circuit pages; tests keep using them as regression references.
