# Unified valve catalogue

`public/tubes.json` is the sole live data source for designer, characteristics and modeller definitions: `{version: 1, devices: [...]}`. The classic script tubes.js fetches and validates it asynchronously, then installs the canonical object and derived views. There is no separate live templates dataset.

## Entry ownership

| Section | Fields and meaning |
| --- | --- |
| Identity | `name`, `category` (smallSignalTriodes, smallSignalPentodes, powerTriodes or powerPentodes) |
| `model` | Device/equation type and coefficients, including the sole persisted `mu` |
| `display` | `vaMax`, `iaMax`, `vg1Max`, `vg1Step`, `paMax`, and pentode `vg2Max` |
| `fitting` | Datasheet `vaMax`, `iaMax`, `vg1Start`, `vg1Max`, `vg1Step`, pentode fixed `vg2`, and optional relative `image` path |
| `static` | Reference `va`, positive grid-bias magnitude `vg1`, `ia`, and pentode `vg2`/`ig2`; no coefficients |

Voltages are V, currents mA, power W. Grid sweeps use positive magnitudes for negative bias. Display screen voltage and fitting fixed screen voltage are independent, as is the static reference screen voltage. Image paths are relative to the public pages and identify the traced plot; they do not automatically load an image into the browser or embed it in an export. The user still selects the local image.

Mu is fitted to the characteristic curves. The EF37A model retains mu=23 even if the quoted datasheet figure is 28; a static reference must not override that fit.

## Compatibility boundary

`valveDisplayDefinition(entry)` creates a cloned, flat definition for the existing Device/calculation/Characteristics APIs. The four original category arrays are derived through this function, rather than separately maintained. `valveFittingDefinition(entry)` creates a flat fitting view for the old modeller adapters. `valveFittingCatalogue(device)` selects canonical entries for each fitting mode.

ToolsWorkspace applies fitting start/screen settings and suppresses the adapters' automatic initial normalisation while loading a saved fit. Saved coefficients therefore remain unchanged until the user deliberately edits fitting/model/reference controls. The legacy internal numbered mu field is a UI bridge, displayed under Model coefficient; it is never serialized as a static parameter.

Model JSON downloads and the read-only JSON panel now contain one nested entry, suitable for insertion into the JSON file’s `devices` array. Export preserves the category, fitted coefficients, static point, both sets of axes and image reference. No model import or automatic catalogue write is implemented. The synthetic `.vwp` format remains unchanged.

## Migration and verification

All 15 live coefficient sets and existing static points/display ranges were preserved. Fitting axes come from the previous seeds where present. Other initial voltage/current extents come from the matching traced-image filename where parseable, with existing grid sweeps. These defaults remain editable; filename-derived axes do not imply digitised grid calibration. EL34 lacked a live static point, so its former seed supplies the existing 250 V / 250 V / 12.2 V / 100 mA / 14.9 mA reference.

The [full model archive](model-catalogue-archive.md) and [former fitting seeds](fitting-template-archive.md) preserve historical inputs. Frozen mathematical fixtures are unchanged. `tests/catalogue.cjs` verifies the migration against `catalogue-before-consolidation.json` and exercises all designer combinations. `tests/tools-workspace.cjs` loads all 15 fits, checks non-mutation and coefficient preservation, and verifies nested export/display projection current round trips. Existing numerical failure cases remain explicit; schema migration does not alter model equations or inverse searches.

## Asynchronous startup

All three pages load tubes.js before their controller scripts and workspace-startup.js last. Controllers do not start themselves. A loading panel remains visible and main workspace hidden while loadValveCatalogue fetches tubes.json. Successful validation installs all category views atomically before the controller starts. Initialisation briefly reveals the containers so responsive charts can measure them. The current URL/hash is read at actual startup, preserving navigation during a delayed load.

Concurrent calls share one in-flight request; successful data is cached for that page. Network, HTTP, JSON parsing and schema errors clear the failed request so Retry loading can fetch again. A 15-second timeout aborts and rejects stalled loads. Validation checks schema version, unique names, all sections, supported Cohen–Helie triode/simple pentode families, finite required coefficients, usable ranges/sweeps, static points, category/type consistency, mu ownership and required category coverage. Validation failure never publishes partial state. Other model implementations remain in designer.js but require extending catalogue/fitting validation before reintroduction.

If controller initialisation itself fails (for example unavailable Chart.js), the error panel offers Reload page rather than reusing a partially initialised controller. Direct file:// access shows instructions to serve via HTTP. Live Server remains suitable; no build/backend is required. tests/catalogue-loading.cjs covers the fetch lifecycle and DOM startup contract, plus a real local HTTP fetch. It does not substitute for a browser layout check.
