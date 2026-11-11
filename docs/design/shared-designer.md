# Shared circuit designer

`public/designer.html` hosts all eight circuit calculators in one responsive workspace. The original calculator HTML URLs redirect to their matching hash routes. Characteristics and the modellers remain standalone workspaces, linked from the header.

## Circuits and URLs

| Circuit | Shared route |
| --- | --- |
| Triode common cathode | designer.html#triodecc |
| Pentode common cathode | designer.html#pentodecc |
| AC cathode follower | designer.html#accathodefollower |
| DC cathode follower | designer.html#dccathodefollower |
| Single-ended output | designer.html#singleended |
| Ultralinear single-ended | designer.html#singleended-ul |
| Push-pull output | designer.html#pushpull |
| Ultralinear push-pull | designer.html#pushpull-ul |

The empty fragment defaults to triodecc using replaceState. #circuits shows the generated directory; unknown fragments show a recovery view. Circuit selection changes the fragment without a reload. Back/Forward restores the corresponding circuit and its in-memory edits. The skip link focuses main without changing the route. Each old HTML page uses location.replace to avoid creating an extra redirect step in browser history and contains a fallback link.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| circuit-definitions.js | All eight calculators’ named inputs, defaults, units/scales/ranges, result paths, chart series, valve lists, schematics/help and result notes; generated selector/directory links |
| designer-workspace.js | DesignerSession raw edit state, validation/conversion, routing, generated controls/results, legend/Chart.js presentation and error recovery |
| designer-workspace.css | Isolated responsive layout and readable typography |
| designer.html | Accessible shared shell and classic deferred-script loading |
| calculations/ | Unchanged browser-independent circuit functions |
| calculatedcircuit.js and former calculator adapter scripts | Retired numbered-field implementations, retained only as regression references |

All calculation scripts load before the definitions and controller. The shared page uses native DOM listeners and does not load jQuery or the retired adapters. Viewer/modeller pages retain their existing dependencies and original designer.css.

## Units and state

Metadata defaultValue uses calculation units; scale converts displayed values into those units. Resistance inputs display kΩ and multiply by 1000. Voltage/current inputs use V/mA. Screen taps display 0–100% with scale 0.01 into the existing 0–1 API, accepting both endpoints. Output resistance uses Ω; transconductance uses mA/V. Required positive inputs reject zero; inclusive/ranged parameters are validated from metadata. Result values retain the original three-decimal formatting.

DesignerSession holds raw strings and a valve index separately for each circuit. Switching circuits or visiting the directory retains valid and invalid edits; reset restores only the current circuit’s parameter defaults and keeps its selected valve. State is in memory: it is not a saved design and is not retained across reloads or leaving the document. Device definitions are cloned before calculation. DS entries show datasheet provenance; other entries are described only as catalogue models.

Validation/calculation failures clear stale results and the graph and display a readable alert. Correcting an input or resetting restores the calculation. If Chart.js cannot load, numerical results remain available and the graph area explains the connection/reload action.

## Presentation and preserved behaviour

All controls, result rows, help and schematics are selected from circuit metadata. Desktop results sit beside the chart; the number of rows determines the minimum plot height, and the plot fills additional height required by the table. At smaller widths results move below the chart. Phone layouts stack the panels and show component inputs in two columns. Body/help text is 16px and result units are 14px.

The chart has explicit axis units and a generated circuit-specific legend. The AC follower distinguishes bias, DC and AC lines; the DC follower retains both differently coloured operating-point markers and its follower line. Power stages show the AC load line. The dissipation curve remains a reference rather than an enforced limit. Overlay order and sampled coordinates are preserved while applying workspace colours.

Original explanatory paragraphs and schematic PNGs are retained. The original single-ended pages explicitly note an inaccurate output-power calculation; that limitation remains visible in their help/result note. Push-pull results identify per-valve cathode current and the shared resistor. No solver equation, coefficient, sampling resolution, bias-search policy or approximation is changed by migration.

## Verification

Run all four regression scripts documented in [development.md](development.md). The original fixtures are unchanged. Shared-workspace checks now include all twenty circuit cases and every plotted coordinate, independent per-circuit state, percentage conversion/ranges and old-URL redirects. The retired adapters are loaded explicitly by test helpers rather than through redirect pages, keeping earlier numerical/chart snapshots usable as independent references. Browser coverage is recorded in the development guide.

The Circuit designer header is a disclosure dropdown generated from the circuit directory, with links to all eight tools and the directory. It highlights the current route, closes after selection/outside click or Escape, and retains native keyboard link navigation. Only one header dropdown stays open at a time. The mobile dropdown is constrained to the viewport.
