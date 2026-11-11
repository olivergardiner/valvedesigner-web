# Datasheet fitting and interchange

## Purpose and workflow

The two browser modellers create representative characteristics from datasheet images without measuring an individual valve. Fitting is manual and visual: there is no curve digitiser, residual minimiser or automatic optimiser.

The active catalogue contains representative datasheet fits with plain device names. Previously DS-labelled triodes and all other original definitions are preserved in model-catalogue-archive.md; traced plots are stored in `curves/`. Preserve this provenance when editing definitions.

1. Open public/modelling.html#triode or public/modelling.html#pentode and select a nearby template.
2. Set the chart voltage/current extents, positive grid-bias magnitude range and step, and dissipation overlay. Pentodes also need the screen voltage matching the datasheet curves.
3. Select a cropped PNG or JPEG curve image, for example from curves/. The image is drawn behind the generated curves by a Chart.js plugin, stretched to chartArea on every draw and resize. Crop to the plot axes and match chart limits; opacity is adjustable. There is no axis calibration interface.
4. Enter a representative static point and mu. Use positive magnitudes for negative grid bias, V for voltages and mA for currents.
5. Adjust shape sliders and compare several grid curves, particularly around the intended operating region. Recheck scaling when changing the reference point or mu.
6. Edit the populated device name, then download the full model JSON or copy it from the read-only text area. Adding it to tubes.js is a deliberate source edit; there is no model JSON import button.

Switching template discards edits to the selected clone. Switching between triode and pentode modes retains each mode’s adapter, field/slider values, selected template and image until the page is left or reloaded. Reset template restores fields and coefficients while retaining the image. Original modeller URLs redirect to the matching modelling.html hash.

ToolsWorkspace generates labelled controls and delegates coefficient mapping, normalisation, sampling and .vwp export to the existing tool adapters. It overrides chart presentation and fixed image alignment only. Input checks reject non-finite values, reversed sweeps, non-positive steps/limits and more than 201 grid curves. Reference voltages, currents and mu must be positive; grid bias may be zero. The viewer omits the unused screen field for triodes.

## Triode fitter

TriodeModeller uses CohenHelieTriode. Sliders adjust vct, kvb, kvb1, kp and x; mu comes from the static fields. updateModel computes the excitation E at the entered static point and sets kg1=E/Ia[mA], normalising the model to that point. kp slider scaling depends on mu. The fitter does not fit the separate SimpleTriode class.

## Pentode fitter

PentodeModeller uses SimplePentode. Sliders adjust beta (knee position), gamma (sharpness), alpha (grid-dependent knee shift), kp (compression) and a (residual slope). potFunction/inversePotFunction provide slider tapering, with slider coordinates normalised by 200.

updateModel calculates the simple excitation E at the reference screen/grid voltages and sets kg1=E/(Ia+Ig2), kg2=E/Ig2, using mA. This normalises the excitation/partition scales; it does not solve every knee/slope term to force an exact full-model match at the reference anode voltage. Mu is entered directly. Screen currents are retained in the sampled point metadata, but the modeller does not display a separate screen-current curve.

## Characteristics export

Characteristics is separate from the fitters. It plots triode characteristics (or screen-tied anode-current curves for a pentode) and fixed-screen pentode anode/screen curves. downloadJSON creates tube.vwp using Blob and a temporary object URL.

The JSON envelope is project with name, deviceType and measurements. Each measurement contains sweep settings, deviceType, testType=anodeCharacteristics, iaMax, paMax and sweeps. Each sweep has vg1Nominal and samples containing va, ia, vg1, vg2, ig2, vh and ih. Currents are mA. createSweeps takes odd point indices starting at 1, giving 50 samples from a 101-point curve. Heater values are fixed placeholders (6.3 V, 0.3 A), not measurements.

Several exported sweep metadata fields are hard-coded rather than copied from chart settings. The screen-tied series also stores vg2=0 and ig2=0 in point metadata despite evaluating anode current with screen voltage equal to anode voltage. These are current limitations, so export should not be presented as measured data or assumed fully faithful interchange. No round-trip compatibility check with Valve Workbench is supplied here.
