# Working on Valve Designer

Valve Designer is a static JavaScript suite for triode and pentode audio circuit design and interactive datasheet fitting. Read README.md and docs/design/README.md before changing behaviour. Prefer simple representative models where sufficient, while retaining support for detailed models and measured-device parameters.

## Repository map

- `public/designer.js`: numerical helpers, Circuit, Device and all model classes.
- `public/curves.js`: browser-independent curve sampling; `public/plotting.js`: shared datasets and Chart.js configuration. Load both before designer.js.
- `public/calculations/`: browser-independent circuit functions and shared validation/bias/intersection helpers.
- `public/calculatedcircuit.js`: common result-to-UI adapter and transformer-stage presentation metadata.
- `public/tubes.js`: calculator/viewer catalogue; `public/templates.js`: separate modeller templates.
- Matching `public/<tool>.html` and `.js`: page wiring and tool implementation.
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
- Add models through Device dispatch. Document parameters and deliberately update the applicable catalogue/template; these are separate datasets.
- New calculators need a page, subclass, applicable valve list, navigation, illustration and documentation. Check both menu.js and designer.html.
- Existing unchecked intersection failures are limitations, not a reliable error API. Numerical work should handle failure explicitly.
- Update design documentation when changing units, equations, formats or calculation assumptions. Record significant decisions in docs/design/decisions.md.

## Verification

There is no build, package manifest or CI configuration. Run `node tests/numerical-baseline.cjs` for the numerical regression suite and triode page-adapter smoke checks. Also run `node tests/plot-baseline.cjs` for all tools’ chart/output/export snapshots and shared sampling contracts. Follow docs/design/development.md. Run `git diff --check`; check JavaScript syntax with Node when available. Manually exercise affected pages for behaviour changes. Numerical changes require representative before/after results with units, tolerances and failure cases; visual plausibility alone is insufficient. Do not introduce a tooling migration for a small fix.

Report files changed, checks actually run and remaining limitations. Do not claim browser checks or tests ran unless they did. Do not publish or push unless requested.

Run `node tests/circuit-calculations.cjs` for twenty circuit baselines, direct calculation contracts and all eight adapters' error recovery. Calculation functions must return plain data and remain independent of UI; presentation metadata belongs to the adapters.
