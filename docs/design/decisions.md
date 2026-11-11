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
