# Roadmap

Suggestions following the November 2026 source review. These are not approved implementation tasks. Existing behaviour is documented in docs/design/.

## Establish numerical confidence

- Initial baseline harness implemented: `node tests/numerical-baseline.cjs` freezes six legacy calculator cases and checks the extracted triode calculation. Extend coverage to model currents, forward/inverse residuals and independently validated reference values.
- Correct intersection handling for endpoints, horizontal/vertical segments and overlaps. Circuit calculations now reject the no-crossing sentinel through a shared wrapper; the geometric algorithm still needs improvement.
- Shared grid sampling now rejects invalid/non-positive steps. Extend finite/range checks and user-facing failure handling across all tools, and add explicit inverse-search convergence status.
- Review the pentode common-cathode two-pass approximation against a converged solution and review gain/follower voltage approximations before altering them.
- Reconcile synthetic .vwp sweep metadata and screen-tied sample metadata with evaluated curves; document or remove heater placeholders.

## Improve daily use

- The index redirect is fixed, and both modellers are linked from the shared designer. Characteristics and Model Fitting now share the modern navigation and presentation.
- Model naming, instructions and JSON download are implemented. Consider model import and session save/load.
- Responsive plot-area alignment and opacity are implemented. Add axis calibration; consider optional curve digitisation/optimisation after reliable manual fitting is established.
- Pin Chart.js to a verified version and consider local dependency copies for reproducible offline use.
- Improve smaller-screen layout and field units/validation while retaining fast component-value editing.

## Extend circuit coverage

- Long-tailed-pair and cathodyne phase splitters (currently placeholders).
- Populate power-triode definitions when suitable source data and validation are available.
- Consider model provenance/source metadata and shared catalogue tooling without losing the distinction between fitting seeds and design definitions.
- Consider richer export and comparisons of operating points/models after numerical baselines exist.

Avoid adding a general circuit simulator or a framework migration without a concrete need. The compact static design tools are a useful foundation.

## Architecture work completed

All eight circuit calculations now run independently of the browser UI. Transformer variants share one calculation, and all calculators share a result adapter. Regression checks cover the extraction. Steps 1 and 2 of the shared UI provide metadata-generated controls for all eight circuit calculators. All seven remaining calculators are now migrated, with independent in-page edit/model state and redirects from original URLs. Step 3 modernises Characteristics and combines both fitters in modelling.html, preserving adapter mathematics and export contracts.
