# Circuit calculations

## Shared numerical methods

Model.anodeVoltage solves for voltage given anode current in mA and grid voltage. It starts at 300 V, estimates a gradient using a 0.01 V forward difference and limits each voltage step to the interval from the previous value divided by 1.2 to the previous value multiplied by 1.2. Model.screenVoltage applies the same approach to cathode current, starting at 500 V. Both stop at a current error of 0.005 mA, a zero gradient or a 1000-iteration cap, returning the last voltage without convergence status. They do not impose device-rating bounds or explicitly reject non-finite values.

`intersection(series1, series2)` scans segment pairs, solves their line equations and returns the first accepted crossing plus segment indices i and j. It uses strict interior bounds in both coordinates. Endpoint crossings, horizontal/vertical segments and collinear overlaps can therefore be missed. Failure returns point (0,0) with i=j=-1. All circuit functions now use a shared wrapper to reject this sentinel explicitly; the underlying geometric algorithm is unchanged.

Most curves use roughly 100 sampling intervals and linear segment interpolation. Resolution and sweep limits therefore affect results. Dissipation overlays use `Ia[mA] = 1000*Pa[W]/Va[V]`; they are visual overlays, not enforced constraints.

## Small-signal stages

TriodeCC intersects the resistor load line, with intercept `1000*Vb/(Ra+Rk)`, with a sampled cathode-bias line. For each positive bias magnitude vg it takes `Ia=1000*vg/Rk` and inverts the model at grid voltage -vg. It derives bias and gain estimates from that crossing. The extracted calculateTriodeCC function preserves the final legacy bypassed gain from a neighbouring characteristic/load-line estimate. The old intermediate analytic bypassed estimate was overwritten before display and is no longer calculated. Ordinary results and curves are covered by frozen baselines. Invalid positive-domain inputs, excessive grid-sweep counts, non-finite results and missing crossings now throw explicit errors, which the triode page displays while clearing its results. The underlying inverse solver and intersection algorithms are unchanged.

PentodeCC first solves a screen-resistor load-line intersection using cathode current (anode plus screen), then intersects an anode characteristic at the estimated bias with the anode resistor load line. calculatePentodeCC makes two passes: first ratio 0.5, then the first anode-voltage result divided by Vb. This is a fixed two-pass approximation, not iteration to a joint convergence criterion. Transconductance uses grid perturbations of ±0.05 V; gain estimates combine gm and the parallel anode/load resistance.

ACCathodeFollower uses the bias resistor to generate a model-inverted bias line, intersects it with the total resistor load line, estimates output impedance as 1/gm and adds an AC load line using Rk parallel Rl. The stored/displayed voltage calculations should be checked against the topology before changing them; variable names alone do not distinguish every node voltage from valve voltage.

DCCathodeFollower solves the first triode similarly to TriodeCC, then derives follower voltage/current and draws its load line. It does not independently solve a second full nonlinear valve operating point. Its returned gain preserves the original final curve-intersection estimate. The overwritten intermediate analytic estimate has been removed.

## Transformer output stages

Unlike resistor-biased stages, output calculators accept target anode bias current. They search grid bias over the configured range for the smallest absolute current error, then add screen current to obtain cathode current and calculate Rk. SingleEnded uses 1001 bias candidates; the other three output tools use 101. Ultralinear tools double the catalogue grid range.

Single-ended AC load-line slope is -1000/Rload in mA/V. Push-pull blends slopes -2000/Raa and -4000/Raa using smax with smoothing factor 5 (in the current coordinate). Raa is the anode-to-anode load. Push-pull cathode resistance is calculated for a shared resistor carrying twice the per-valve cathode current; displayed cathode current is per valve.

Ultralinear curves evaluate screen voltage as `Vg2 = Va*tap + Vb*(1-tap)`. Thus tap 0 holds the screen at Vb; tap 1 ties screen voltage to anode voltage. At the quiescent Va=Vb, screen voltage is Vb for every tap.

Output power is estimated from the crossing of the zero-grid characteristic and AC load line: `(Vb-Vcross)*Icross/2000` with current in mA. This is a load-line estimate, not waveform simulation or a distortion calculation. Transformer losses, parasitics, supply sag and frequency dependence are not represented.

All eight calculator pages now handle invalid inputs, non-finite results and missing intersections explicitly through the shared calculation adapter. See [calculation-api.md](calculation-api.md) for the consolidated interface.
