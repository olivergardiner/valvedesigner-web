# Modelling rationale and owner references

Read alongside [models.md](models.md) for the implemented equations and units. These owner-authored articles explain design intent and historical experiments; they are not interchangeable specifications for every model class. Reviewed 11 November 2026.

## Detailed models and measured devices

[Valve modelling](https://whitecottage.org.uk/guitar-and-audio/valve-modelling/) develops the Koren/Cohen–Helie/Reefman lineage, including grid-dependent knee position, adjustable knee sharpness, separate screen-current shaping and secondary emission. It explains the distinct screen scaling coefficient kg2a, while acknowledging possible measurement-related discrepancies. Detailed measured-device fitting and parameter estimation belong to that context; this browser repository does not implement the article's automatic fitting process.

## Representative pentode models for design

[Further thoughts on valve modelling](https://whitecottage.org.uk/further-thoughts-on-valve-modelling/) (5 October 2024) distinguishes accurate measured-device fitting, matching, ordinary amplifier design and unusual operating regions. For ordinary design it proposes the eight-parameter simple pentode model, using a static datasheet point and five curve-shaping controls. Its fixed exponent and omitted contact/island/secondary-emission terms are deliberate simplifications. Screen current remains essential to calculating small-signal pentode operating points, even when detailed screen curves are unavailable. This is the rationale for SimplePentode and the manual pentode fitter.

## Why triodes retain Cohen–Helie

[Further, further thoughts on valve modelling](https://whitecottage.org.uk/further-further-thoughts-on-valve-modelling/) (9 October 2024) reports that the reduced triode model could not fit the 12AX7 curves satisfactorily, motivating restoration of the full Cohen–Helie controls. It also discusses inconsistencies between quoted static characteristics and plotted datasheet curves, and explores a different voltage/exponent arrangement. Treat that last discussion as experimental context, not authority to replace the implemented SimpleTriode equation or its coefficients.

## Architectural implications

The following are implementation guidance inferred from the articles and the owner's stated preference for representative design models:

- Keep circuit solvers independent of model family. Shared sampling and rendering must not require a particular excitation equation.
- Preserve anode, screen and cathode current distinctions in pentode calculations. A visually good anode fit alone does not validate screen-dependent bias results.
- Retain the manual datasheet workflow. Future automatic fitting can complement it, with its own validation and data requirements.
- Choose complexity according to the operating region and purpose. A model suitable for ordinary amplifier design is not automatically suitable for positive-grid or low-voltage experiments.
- Record datasheet/measurement provenance when extending device definitions, and distinguish a fitted curve parameter from an independently verified physical constant.

No model equation, catalogue coefficient or circuit result was changed when these references were incorporated. Check units and the current source before translating article notation into code.
