# Valve models and device definitions

See [modelling-rationale.md](modelling-rationale.md) for the owner's articles explaining the model choices and their intended uses. This document describes the current implementation.

## Units

| Quantity | Convention |
| --- | --- |
| anodeCurrent, screenCurrent, cathodeCurrent returns | A |
| anodeVoltage(ia, ...) and screenVoltage(ik, ...) current arguments | mA |
| Plots, iaMax, static.ia and static.ig2 | mA |
| Model voltages | V, cathode-relative; vg1 is signed |
| UI grid sweeps and static.vg1 | Normally positive negative-bias magnitudes |
| Resistors, dissipation, screen tap | Ohms, W, dimensionless fraction |

Most model implementations divide internal currents by 1000; Ayumi directly returns A. Coefficients from other implementations cannot be assumed to share scaling.

## Device dispatch

| model.device | model.type | Class | Parameters read |
| --- | --- | --- | --- |
| triode | cohenHelie | CohenHelieTriode | mu, kg1, kp, x, kvb, kvb1, vct |
| triode | ayumi | AyumiTriode | vg0, muc, alpha, G, xg, Glim |
| triode | simple | SimpleTriode | mu, kg1, kp, x |
| pentode | gardiner | GardinerPentode | Cohen–Helie parameters plus kg2, kg2a, alpha, beta, gamma, a, lambda, nu, omega, s, ap, os, rho, tau, theta, psi |
| pentode | simple | SimplePentode | mu, kg1, kg2, kp, alpha, beta, gamma, a |

Unknown combinations leave device.model unset; there is no schema rejection. Koren and Reefman are part of the modelling lineage, but there are no separate koren or reefman dispatch branches.

## Equations as implemented

Cohen–Helie uses anode voltage v and signed grid voltage g:

```text
f = sqrt(kvb + v*kvb1 + v*v)
E = (v/kp * log(1 + exp(kp*(1/mu + (g+vct)/f))))^x
Ia = E/(1000*kg1)
```

GardinerPentode reuses this excitation with screen voltage replacing anode voltage, then applies separate anode/screen partition, knee, slope and optional secondary-emission terms. Anode and screen currents are independently clamped nonnegative. Their formulas use distinct kg2 and kg2a coefficients. The secondaryEmission flag controls these terms and is unused by simple models.

SimplePentode uses screen voltage s, anode voltage v and signed grid voltage g:

```text
E = (s/kp * log(1 + exp(kp*(1/mu + g/s))))^1.5
q = exp(-(beta*(1-alpha*g)*v)^gamma)
Ia = max(E*((1/kg1-1/kg2)*(1-q) + a*v/kg1), 0)/1000
Ig2 = max(E*(1 + (kg2/kg1-1)*q - a*v)/kg2, 0)/1000
```

It fixes the exponent at 1.5 and omits explicit secondary emission. This compact representation suits representative circuit-design fits.

SimpleTriode has a distinct expression: `Ia = v*(log(1 + kp*exp(1/mu + g/v))/kp)^x/(1000*kg1)`. Do not assume it is the same excitation law as SimplePentode. The triode fitter actually targets CohenHelieTriode.

Ayumi uses ramped voltage expressions, an internal grid-current branch and an anode-current limit. Its constructor derives and writes model.mu for downstream gain calculations. Shared cathodeCurrent adds anode and screen current only; it does not separately include Ayumi grid current.

## Data contract

tubes.js defines smallSignalTriodes, smallSignalPentodes, empty powerTriodes and powerPentodes. templates.js separately defines modeller seeds. Definitions contain name; chart extents vaMax and iaMax; grid sweep vg1Max and vg1Step; dissipation paMax; pentode vg2Max; and the model object. An optional static object provides va, positive bias magnitude vg1, ia and pentode vg2/ig2. Modellers require static data; ordinary calculator entries need not include it.

Plot maxima are not a complete validated set of ratings. Multiple definitions for the same valve can reflect different models or provenance and should remain distinct. Fitter JSON is a device definition, not a Valve Workbench project.

Catalogue names marked `DS` identify datasheet-derived models created using the browser modellers. The corresponding traced datasheet curves are in `curves/`. These represent datasheet characteristics rather than measurements of an individual device. The marker identifies provenance; its absence alone does not establish how another model was obtained.

Zero voltage, exponential overflow or invalid coefficients can produce non-finite values. Some circuit plotters seed the origin explicitly; viewers and modellers evaluate zero directly. No common domain guard exists. Model changes require numerical comparison over the intended operating region.
