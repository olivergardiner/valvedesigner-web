# Development and verification

## Running locally

Open public/designer.html directly in a modern browser, or serve the repository using an existing static HTTP server. If Python is installed, run this from the repository root:

```powershell
python -m http.server 8000
```

Visit http://localhost:8000/public/designer.html. Use direct URLs for characteristics.html, triodemodeller.html and pentodemodeller.html; the calculator menu lists circuit tools only. Avoid public/index.html until its relative redirect is corrected. Chart.js and jQuery require CDN access. No npm installation or compilation is required; structuredClone requires a modern browser.

## Existing checks

There is no package.json or CI configuration. Run the dependency-free regression harness with `node tests/numerical-baseline.cjs`. It compares six frozen pre-extraction cases (three triodes, EF86 common cathode, EL84 single-ended and push-pull), including every plotted point and displayed output. Numeric tolerance is 1e-10 absolute plus 1e-12 relative in native units (V and mA for curves); formatted outputs must match exactly. It also checks calculation independence/determinism, invalid inputs, non-finite inverse results, missing crossings, and triode page startup/error recovery with DOM/chart stand-ins. This is not a real-browser test or an independent verification of physical accuracy. Fixtures were captured before extraction and should not be regenerated merely to make a changed implementation pass.

Node can check script syntax as follows. Node can check classic-script syntax without running browser-dependent code:

```powershell
Get-ChildItem public -Recurse -Filter *.js | ForEach-Object {
    node --check $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Syntax check failed: $($_.Name)" }
}
git diff --check
```

These checks do not validate circuit mathematics or browser behaviour. Documentation-only changes need diff and link checks; no new test framework is needed for them.

## Behaviour verification checklist

- Open each affected tool; check browser console, CDN loading, schematic image, labels and initial chart.
- Select another valve and edit each affected input. Confirm outputs and plots update, without stale datasets or catalogue mutation.
- For small-signal stages, record operating voltages/currents and gains. For power stages, include screen setting/tap, bias current, transformer load, cathode resistor and estimated power.
- For modeller changes, load a datasheet image, check alignment, move each slider, edit the static point and name, switch templates and parse the copied JSON.
- For export changes, parse tube.vwp and compare actual sample voltages/currents and metadata against the configured chart. Document synthetic values.

## Numerical work

Capture before/after values for representative triodes, small-signal pentodes and power pentodes across the affected operating region. Specify units and acceptable error rather than accepting a plausible plot. Exercise cutoff, the knee, zero/near-zero voltages, unsupported models, missing crossings and non-convergent searches when relevant. Changes to intersection need endpoint, vertical/horizontal, parallel and overlap cases. Changes to inverse searches need forward/inverse residual checks and failure reporting.

Candidate future regression coverage is in ROADMAP.md. Do not describe proposed checks as an existing suite. Keep application changes separate from documentation-only work.

## Plotting regression checks

Run `node tests/plot-baseline.cjs` after changes to shared sampling or presentation. Twelve frozen SHA-256 snapshots were captured before this extraction: all eight circuit pages, triode/pentode viewer cases, and both modellers. They compare canonicalised chart configurations (including every point, colour, label and limit), field values and viewer export contents. Object property order is ignored; numeric values and array order must match exactly. Non-finite numbers are encoded explicitly rather than collapsed to null. These snapshots preserve existing behaviour, including known limitations; they are not physical reference measurements.

The same command checks origin evaluation versus synthetic origins, sweep counts/endpoints, ultralinear screen callbacks, A-to-mA conversion, dissipation-disabled behaviour, invalid grid steps and HTML script dependency order. Shared grid sweeps reject non-finite/non-positive steps and steps too small to advance, rather than looping indefinitely. All eight calculator pages now share the calculation adapter's error display; viewer/modeller validation remains separate work.

Browser verification for this extraction: all eleven tool pages loaded through Live Server, displayed their controls/results and reported no console errors. The triode chart was also inspected visually. Image uploads and every possible device/parameter combination were not exercised.


## Consolidated circuit regression checks

Run `node tests/circuit-calculations.cjs`. Twenty numerical cases were captured before consolidation: two for each of eight circuits, plus tap 0 and tap 1 for both ultralinear variants. These cover changed supply/component/load values, Cohen–Helie and Ayumi triodes, Gardiner/simple EF86 models, and EL84/6550 output models. Every plotted point is compared with 1e-10 absolute plus 1e-12 relative tolerance in native units; displayed outputs match exactly. Do not regenerate fixtures just to accommodate a changed implementation.

The command invokes every circuit calculation without DOM/jQuery/Chart.js globals, checks deterministic repeats and unchanged inputs, and exercises invalid/missing inputs, unsupported devices, invalid sweeps/taps, non-finite results and missing intersections. All eight page adapters are tested for clearing stale charts/results and recovering from corrected inputs with DOM/chart stand-ins. The original numerical and plotting baselines remain additional regression references.

Browser verification for this consolidation: all eight calculator pages loaded through Live Server, switched to a second valve, rejected a typed zero supply voltage, cleared displayed results and recovered when the original supply was restored. No console errors were reported. The full catalogue, image uploads and every possible input combination were not exercised.
