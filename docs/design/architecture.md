# Architecture

## Runtime

Each tool is a standalone HTML page with classic scripts and inline event handlers. There is no backend, bundler, module loader or persistent application store. Pages load Chart.js from an unversioned jsDelivr npm URL and jQuery 3.7.1 from code.jquery.com, followed by curves.js, plotting.js, designer.js, the tool script and tubes.js or templates.js. Calculator pages also load menu.js. Eclipse metadata is present but is not a JavaScript build system.

`public/designer.html` is the landing page. `public/index.html` redirects to `public/designer.html` relative to itself, producing an extra public path component under ordinary static hosting.

## Responsibilities and lifecycle

| Component | Responsibility |
| --- | --- |
| Circuit in designer.js | DOM parameter binding, device loading, dataset lifecycle and Chart.js rendering |
| Device | Dispatch on definition.model.device and definition.model.type |
| Model subclasses | Forward current equations and shared inverse searches |
| Functions in calculations/ | Topology calculations and plain result/curve arrays |
| CalculatedCircuit | Named parameter binding, result formatting, chart series and error recovery |
| Circuit subclasses | Page field and presentation metadata |
| Characteristics | Curve generation and synthetic Valve Workbench export |
| Modeller subclasses | Slider mapping, reference-point normalisation, image overlay and JSON display |
| HTML pages | DOM contract, script ordering, device lists, construction and events |

Inline page code obtains canvases, constructs the global `circuit`, configures fields, builds the selector and loads the initial device. `loadDevice(list, index)` uses structuredClone, constructs Device, calls onDeviceLoad() and redraws. `loadSingleDevice(definition)` retains the supplied definition without cloning. The model holds a reference to the selected definition's model object, so slider edits immediately affect evaluations without modifying the source catalogue.

`showPlots()` destroys previous charts, clears dataset arrays, then calls loadLines(), anodePlot(), anodePowerPlot() and drawChart(), in that order. Characteristic plotting can depend on operating-point state computed first. Main chart datasets combine operating points, dissipation limits and anode curves. The characteristics viewer supplies a second canvas for fixed-screen pentode and screen-current curves.

All eight circuit calculators now delegate to browser-independent functions in public/calculations/. They accept a Device plus named parameters and return named operating-point/derived values and plain curves. They do not mutate their inputs or call DOM/Chart.js APIs. CalculatedCircuit in calculatedcircuit.js maps those results to the existing page fields and charts. Four transformer output variants share one calculation and TransformerOutputCircuit presentation metadata. Models and numerical APIs remain in designer.js. There is no separate simulation controller or document model. See [calculation-api.md](calculation-api.md).

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

SVG drawings live in svg/; calculator pages display corresponding public PNGs. Users explicitly select datasheet images, read as data URLs by FileReader and applied as CSS canvas backgrounds. No automatic curve-image catalogue, circuit save/load, model JSON import or reload persistence exists.

## Shared sampling and presentation

All tool pages now load curves.js and plotting.js before designer.js, preserving classic-script globals. curves.js produces plain data: voltage samples, grid families, anode-current curves, load lines and dissipation curves. Anode sampling accepts a constant screen voltage or a voltage callback for ultralinear stages. The pure triode calculation uses this layer without invoking presentation helpers.

plotting.js owns line/point/dissipation datasets and the common Chart.js configuration used by both characteristic charts. Circuit delegates point/load-line creation and offers addDissipationCurve; individual tools still decide which overlays to show. The viewer continues to omit a dissipation overlay. Calculation functions retain topology-specific load-line equations; adapters perform field updates. Modellers retain coefficient updates and image alignment; their sampling and dissipation presentation use the shared helpers.

Sampling explicitly distinguishes a synthetic origin from an evaluated zero-voltage point, and a 100-point sweep omitting zero from the standard 101-point sweep. Grid values still advance by repeated addition, retaining the existing endpoint tolerance. Dissipation uses 100 points and excludes its upper voltage endpoint, as before. Export metadata and known numerical approximations are unchanged.

