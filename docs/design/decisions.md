# Design decisions

These entries distinguish observed implementation from project direction; they are not claims about undocumented historical decisions.

## Static browser tools

Current implementation: standalone HTML, classic JavaScript, jQuery DOM binding and Chart.js rendering. Static hosting requires no server computation or SPICE runtime. Preserve that lightweight deployment unless a change is explicitly agreed. A framework migration is not a prerequisite for numerical improvements.

## Shared forward model API

Current implementation: circuit tools depend on current evaluations at anode/grid/screen voltages, with shared numerical inverse searches when required. Device selects a model from explicit device/type keys. Preserve the A/mA boundary and cathode-relative signed voltage conventions when extending this API.

## Component-based design and target-current output design

Current implementation: small-signal stages derive operating points from component values and sampled load-line crossings. Output stages instead accept desired anode bias current, then estimate bias/resistance and output power. These workflows should be described accurately rather than treating all tools as identical solvers.

## Representative models first

Project direction supplied by the owner: a simple model is normally preferable for design when it adequately represents the relevant curves. Datasheet fitting provides representative characteristics without requiring individual-device measurements. Keep detailed model support for use cases that benefit from it; simplicity does not justify silently changing existing coefficients.

The owner subsequently supplied three articles, linked in [modelling-rationale.md](modelling-rationale.md), as supporting context. Preserve the distinction between model-independent circuit calculation, manual representative fitting and detailed measured-device modelling when extending the architecture.

## Manual fitting with a reference point

Current implementation: sliders control curve shape and a static reference point determines current scaling. Triode fitting uses Cohen–Helie; pentode fitting uses SimplePentode. Automated optimisation is a possible future feature, not an existing capability.

## Separate data collections

Current implementation: tubes.js supplies design/viewer definitions; templates.js supplies fitting seeds. Selected catalogue entries are cloned before editing. Consolidation may be useful later, but must preserve model identity, parameter meaning and reference-point provenance.

## Approximation and failure visibility

Current implementation: sampled curves, bounded gradient steps, a fixed two-pass pentode calculation and simplified power-stage load lines. Solver status and input validation are incomplete. Future numerical changes should expose invalid/no-solution results explicitly and carry regression evidence; current silent fallbacks are not a desired long-term contract.

## First calculation extraction

Implemented November 2026: triode common-cathode calculations accept named parameters and return plain operating-point, gain and curve data. The existing Circuit subclass remains a presentation adapter, retaining classic scripts and the current page layout. Six legacy numerical baselines were captured before extraction. Model equations, sampling resolution and successful-case gain conventions remain unchanged; known intersection/solver limitations remain separate work. Invalid/no-solution triode calculations now report an error rather than displaying a fabricated operating point. No UI framework is introduced.

## Shared curves and chart presentation

Implemented November 2026: browser-independent sampling lives in curves.js; Chart.js dataset styling and configuration live in plotting.js. All eight calculators, the viewer and both modellers use the shared layer. Topology-specific load lines remain with each calculator. Preserve sample ordering, origin policies, colours, labels and existing export metadata while extracting duplication; twelve pre-change snapshots complement the numerical baselines. No layout, model equation or solver-algorithm change is included. Invalid grid steps now fail explicitly at the shared sweep boundary.


## Consolidated circuit calculations

Implemented November 2026: all eight circuit calculators use plain functions, with shared cathode-bias sampling, checked intersections, input/finite checks and curve-derived gain in calculations/common.js. Four transformer output variants share calculateOutputStage, preserving sampling resolutions and shared-resistor conventions. Followers and pentode common cathode retain their specific approximations in separate functions.

CalculatedCircuit handles field binding, named result selection, datasets and expected error recovery. TransformerOutputCircuit additionally shares output-stage presentation metadata. Calculation functions create no UI elements or datasets. Model coefficients, equations, successful-case outputs and layout are preserved. Invalid/no-solution results now produce visible errors across all calculators. Twenty pre-consolidation cases supplement the existing numerical and chart snapshots.

## Shared designer, Step 1

Implemented November 2026: designer.html hosts a metadata-driven triode workspace, with separate setup, chart, result and help panels. The original triode page remains and consumes the same circuit definition. Other circuit choices open existing pages until Step 2. Native DOM listeners and an isolated stylesheet avoid a framework/build migration and changes to original-page styling. The new page uses Chart.js but does not require jQuery.

Hash routes support the triode workspace and circuit directory with browser Back/Forward. Raw edits and selected model are retained in memory within the document, including errors; no persistence across reload or external-page navigation is promised. Resistances display in kΩ and convert explicitly to the existing ohm-based calculation API. Chart styling changes only the shared workspace; calculation functions and legacy plot snapshots remain unchanged.

## Shared designer, Step 2

Implemented November 2026: all eight circuit calculators use the shared metadata/session workspace. Circuit selection updates the hash without reloading; each circuit retains its own raw parameter strings and valve selection. All original calculator URLs now replace themselves with the corresponding shared route, with a fallback link. Retired adapters remain unloaded in production and available to frozen regression checks.

The workspace supports inclusive parameter ranges as well as positive inputs: ultralinear screen taps display percentages and convert to the existing fractional API. Chart overlays and legends preserve topology-specific line/marker identities. Result count controls the desktop result rows and minimum chart height, with the plot filling any extra height needed by the table. Original help/schematics and the known single-ended power-calculation limitation are retained. Calculations and model coefficients are unchanged.

## 2026-11-11: characteristics and fitting workspaces

Keep Characteristics as a separate workspace and combine the two manual fitters under modelling.html#triode and #pentode. ToolsWorkspace owns responsive controls, validation, sessions, local image overlays and downloads, while the original classes retain coefficient mappings, reference-point normalisation, curve sampling and legacy .vwp export. Preserve the frozen numerical/chart/export fixtures. Overlay alignment uses the actual chart plotting area rather than current-dependent fixed pixel offsets. Fitting remains manual; no model import, automatic optimisation or reload persistence is implied.

## 2026-11-11: normalise same-device catalogue ranges

Use the Gardiner definition for EF86 and EL84 plotting/sampling metadata. Use the first catalogue entry for other same-device variants. Align all six range fields while preserving coefficients and static references. Separate modeller templates retain their fitting-image ranges. The owner authorised this catalogue normalisation; affected regression expectations were deliberately refreshed, rather than weakening comparison tolerances.

The EF86 Simple circuit fixture (250 V supply; Rk 1 kΩ, Ra 100 kΩ, Rs 330 kΩ, Rl 470 kΩ) changes from the original frozen 500 V sampling range/grid stop 4.5 V to 300 V/grid stop 5 V. Displayed Vk changes 1.818 → 1.801 V, Va 111.332 → 113.699 V, Ia 1.373 → 1.350 mA and bypassed gain 116.028 → 113.782. This reflects the existing sampled intersection algorithm, not retuned coefficients. EL84 circuit outputs are unchanged; its 200 mA plot maximum changes dissipation sampling, chart axes and viewer export. Existing comparison tolerances remain 1e-10 absolute plus 1e-12 relative for full numerical fixtures. Unaffected fixture cases were retained.

## 2026-11-11: archive the full catalogue and retain datasheet fits

Archive all 25 current definitions verbatim in model-catalogue-archive.md before pruning tubes.js to 15 datasheet fits. Retain DS triodes, the curve-backed 6SN7 and simple pentodes, choosing Simple V2 for EF86/EF37A. Remove model-family/DS name suffixes. Keep coefficients, static references, normalised ranges and separate fitting templates. No tubes.json exists; tubes.js is the classic-script catalogue consumed by the app. Preserve historical fixtures by loading their original models from the archive, and validate the active catalogue independently.

## 2026-11-11: separate fitting axes from model display metadata

Show the fixed-screen pentode chart above the Triode-strapped chart. Model setup contains the datasheet sweep and static point; a lower Display parameters panel supplies the exported model’s designer/viewer ranges. Maintain independent in-page values and validate both. Build exported definitions by cloning the fitted model and applying display metadata, preserving coefficient mappings and normalisation. Keep the existing JSON schema and frozen mathematical fixtures. The owner’s subsequent EF37A normalisation/refit is preserved and explicitly recognised by catalogue checks, rather than restoring its archived values.

## 2026-11-11: unified model and fitting catalogue

Use a versioned JSON-compatible valveCatalogue object inside tubes.js, preserving synchronous classic-script loading. Each entry has name/category plus model, display, fitting and static sections. Mu is persisted only in model. Generate flat display views for existing calculation APIs and fitting views for the modeller. Use live coefficients/static points as authoritative, migrate old seed axes where available and derive other initial axes from the matching curve-image filename plus existing sweeps. EL34’s previously missing static point comes from its former fitting seed. Preserve all six former seeds in fitting-template-archive.md; remove templates.js from the live app. Export the new nested entry shape, including fitting axes; this intentionally changes model JSON export, while .vwp stays unchanged. Opening/resetting a saved fit must not silently normalise its coefficients. Async JSON transport is explicitly deferred.
