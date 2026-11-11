# Working on Valve Designer

Valve Designer is a static JavaScript suite for triode and pentode audio circuit design and interactive datasheet fitting. Read README.md and docs/design/README.md before changing behaviour. Prefer simple representative models where sufficient, while retaining support for detailed models and measured-device parameters.

## Repository map

- `public/designer.js`: numerical helpers, Circuit, Device and all model classes.
- `public/curves.js`: browser-independent curve sampling; `public/plotting.js`: shared datasets and Chart.js configuration. Load both before designer.js.
- `public/calculations/`: browser-independent circuit functions and shared validation/bias/intersection helpers.
- `public/calculatedcircuit.js`: common result-to-UI adapter and transformer-stage presentation metadata.
- `public/circuit-definitions.js`: metadata for all eight calculators and the generated circuit directory. `public/designer-workspace.js`/`.css`: new workspace/session and isolated responsive styles.
- `docs/design/model-catalogue-archive.md`: immutable 25-model source snapshot used by historical numerical tests. `tests/support/archived-catalogue.cjs` reads its source block.
- `public/tubes.json`: unified versioned catalogue data. `public/tubes.js`: async loader, validation and derived flat views. `public/workspace-startup.js`: loading/error/retry UI and deferred initialisation for all three workspaces. Each entry has name, category, model, display, fitting and static; model.mu is the only persisted mu. No separate live templates. See docs/design/catalogue.md.
- Circuit `public/<id>.html` files redirect to the shared workspace. The old calculator adapter scripts remain only for frozen regression checks. Characteristics and modelling.html use tools-workspace.js/.css; both original modeller HTML URLs redirect to modelling.html. Existing tool adapters retain numerical and export ownership.
- `public/menu.js`, `public/designer.css`: navigation and shared presentation.
- `svg/`: circuit drawing sources; corresponding displayed PNGs are in `public/`.
- `curves/`: datasheet curve images for visual fitting.

## Change conventions

- Keep changes scoped. Documentation work does not authorise equation fixes or coefficient changes.
- Preserve classic script loading, global names and the page-level `circuit` used by inline handlers unless a migration is requested.
- Match nearby JavaScript style: tabs, classes and camelCase methods. Avoid unrelated reformatting.
- Keep parameter array indices, counts, HTML field IDs and output labels aligned. Base pages have eight input/output slots; modellers add fields 9–16.
- Model current methods return A; inverse solver current arguments, plot currents and static characteristic currents use mA. Voltages are cathode-relative. UI grid sweeps and static.vg1 normally store positive negative-bias magnitudes; model calls use signed voltages.
- Coefficients belong to specific equations and scaling conventions. Do not silently retune valves or copy raw SPICE coefficients without checking their meaning.
- `loadDevice` clones catalogue data and the model references the selected definition's model object. Preserve that relationship for live fitting. `loadSingleDevice` does not clone.
- Add models through Device dispatch. Document parameters and deliberately update the unified catalogue entry. Model coefficients, display axes, fitting axes and static references have separate ownership.
- New shared calculators need a calculation function, circuit definition with an applicable valve list, labelled units/ranges, result paths, schematic/help and documentation. Directory and selector entries are generated from definitions.
- Existing unchecked intersection failures are limitations, not a reliable error API. Numerical work should handle failure explicitly.
- Update design documentation when changing units, equations, formats or calculation assumptions. Record significant decisions in docs/design/decisions.md.

## Verification

There is no build, package manifest or CI configuration. Run `node tests/numerical-baseline.cjs` for the numerical regression suite and triode page-adapter smoke checks. Also run `node tests/plot-baseline.cjs` for all tools’ chart/output/export snapshots and shared sampling contracts. Follow docs/design/development.md. Run `git diff --check`; check JavaScript syntax with Node when available. Manually exercise affected pages for behaviour changes. Numerical changes require representative before/after results with units, tolerances and failure cases; visual plausibility alone is insufficient. Do not introduce a tooling migration for a small fix.

Run `node tests/catalogue-loading.cjs` after loader/startup changes (HTTP, schema validation, timeouts, retry, atomic install and DOM startup checks). Pages require HTTP serving, including local testing.

Run `node tests/catalogue.cjs` after catalogue changes; it validates retained definitions against the archive and exercises every live circuit/model combination, including explicit known failures. Historical baseline suites use archived inputs; do not regenerate their fixtures for active catalogue pruning.

Run `node tests/tools-workspace.cjs` for tools-workspace changes. Preserve the frozen chart/export fixtures.

Report files changed, checks actually run and remaining limitations. Do not claim browser checks or tests ran unless they did. Do not publish or push unless requested.

Run `node tests/circuit-calculations.cjs` for twenty circuit baselines, direct calculation contracts and all eight adapters' error recovery. Calculation functions must return plain data and remain independent of UI; presentation metadata belongs to the adapters.

Run `node tests/designer-workspace.cjs` for shared-workspace changes. All eight workspace definitions are checked against frozen numerical fixtures; retain the retired adapter checks as independent regression references. Do not regenerate fixtures when changing presentation. Workspace resistance inputs display kΩ and convert explicitly to ohms before calculation.

Ultralinear screen taps display 0–100% with scale 0.01 into the solver’s 0–1 fraction. Preserve inclusive endpoints. Chart series/legends must be circuit-specific, including both DC follower markers.

The old six fitting seeds are preserved in docs/design/fitting-template-archive.md for historical tests only. ToolsWorkspace uses the live catalogue for every fit. Loading a saved model must not renormalise coefficients; normalisation occurs after deliberate fitting edits. Export the nested entry shape, including fitting axes, with no mu under static/fitting.
