# valvedesigner-web
A Javascript valve circuit design aid

## Current repository guide

Open `public/designer.html` in a modern browser, or serve this repository with a static HTTP server and visit `/public/designer.html`. If Python is installed, `python -m http.server 8000` from the repository root serves it at <http://localhost:8000/public/designer.html>. There is no build or npm installation. Chart.js and jQuery are loaded from CDNs and require internet access. The current `public/index.html` redirect has an extra `public/` path component; use the explicit designer URL.

Eight circuit calculators are implemented: triode and pentode common cathode, AC and DC coupled cathode followers, single-ended and push-pull output stages, and ultralinear versions of both output stages. Phase splitters remain placeholders. Small-signal stages derive operating points from component values; output stages accept a target anode bias current.

The [triode modeller](public/triodemodeller.html) fits Cohen–Helie parameters and the [pentode modeller](public/pentodemodeller.html) fits the simple pentode model. Both use manual slider adjustment against an uploaded datasheet image, with current scaling from a static reference point. They do not automatically digitise or optimise curves. Prefer a simple representative model where it adequately describes the intended design region; detailed models remain available.

| Documentation | Contents |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Contributor and coding-agent guidance |
| [Design documentation](docs/design/README.md) | Architecture, models, units, calculations and fitting/export contracts |
| [Development](docs/design/development.md) | Local running and verification |
| [ROADMAP.md](ROADMAP.md) | Proposed improvements and known limitations |

Run `node tests/numerical-baseline.cjs` for numerical regression and page-adapter smoke checks, and `node tests/plot-baseline.cjs` for shared plotting regression checks. Run `node tests/circuit-calculations.cjs` for consolidated circuit calculation and adapter checks. No CI is currently configured. These are steady-state design and load-line tools, not a general transient/frequency-domain simulator. The history below describes the project's origins; the design documents describe the current source implementation.

## Project history

Valve Designer started out as a Qt application and as a companion to the Valve Workbench with the aim of being able to simplify the design process for valve circuits commonly found in audio amplifiers (many of my builds have been guitar oriented but I have also dabbled with a bit of Hi Fi). The Valve Workbench allows you to measure (using an Arduino based analyser circuit after the Valve Wizard) and then model triodes and pentodes. For the modelling, I have explored a number of approaches and have implemented models based on the work of Koren, Cohen & Helie and Reefman, with some minor extensions of my own for pentodes. The value of having these models is that it then simplifies the process of creating automated design tools, and any of the models supported by the Valve Workbench can then be used directly in the Valve Designer.

At this point, I must also reference the work of Giuseppe Amato whose load line calculators on vtadiy.com demonstrate the principle of what can be achieved using this approach using Javascript rather than Qt (using ChartJs as the charting library - which behaves in a very similar manner to QChart in Qt). However, while these calculators are great tools, they only tell you what your load lines look like at your chosen bias point. What I find more helpful is being able to understand how the valves work in the context of practical circuits. The difficulty with this, however, is that it requires you to calculate the operating point of the circuit. In Qt, this is very easy to do by using ngSpice to do the hard work but you can't run Spice in Javascript.

In my Qt experiments, I had already looked at plotting both cathode and anode load lines for triode amplifiers although I was still using ngSpice to calculate the operating point. Calculating the cathode load line for a given value of cathode resistor requires you to vary the grid voltage and find the anode voltage that will achieve the cathode current (i.e. the anode current in a triode) that should be flowing in the cathode resistor for the given value of grid voltage. The models allow you to determine the anode current given the grid and anode voltages but there is no simple way of finding the anode voltage given the grid voltage and anode current. Instead of attempting an algebraic solution, I implemented a gradient based search with half the maximum anode voltage as a starting point. Noting that triode curves are quite "well behaved", the gradient search converges quickly and reliably (this also holds for pentode curves as well). All I needed now was to compute the intersection of the two load lines to find the operating point. Using a charting library is helpful here as your data needs to be supplied as a simple array of points and the algorithm to find the intersection of two line series with linear interpolation is pretty simple.

A quick check against the values obtained from ngSpice showed that the calculations were very accurate and so my solution for a simple triode amplifier was now free from a dependency on ngSpice. A bit more work was required to achieve a similar outcome for a pentode amplifier and most of the other circuits worth considering for audio are either derivatives of these or much simpler to solve. The Qt version currently provides support for the following circuits:
* Triode Common Cathode Amplifier
* Pentode Common Cathode Amplifier
* AC Coupled Cathode Follower (Triode-based)
* DC Coupled Cathode Follower (the "classic" guitar distortion stage)

The following circuits are in the pipeline:
* Long Tailed Pair Phase Splitter
* Cathodyne Phase Splitter
* Transformer output stages (SE/PP, Triode/Pentode and Untapped/Ultralinear)

To return to this project, now that the Qt version is no longer dependent on ngSpice, the static HTML pages represent the porting of the Valve Designer to Javascript (using ChartJs as the charting engine). The currently implemented circuits are available from the [index page](https://olivergardiner.github.io/valvedesigner-web/public/designer.html).

In addition to the circuit designers, there is also a [generic anode characteristics viewer](https://olivergardiner.github.io/valvedesigner-web/public/characteristics.html) and a [pentode modeller](https://olivergardiner.github.io/valvedesigner-web/public/pentodemodeller.html).
