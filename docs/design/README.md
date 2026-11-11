# Design documentation

Source-based baseline reviewed 11 November 2026. Current implementation is described here; proposals are in [ROADMAP.md](../../ROADMAP.md).

| Document | Purpose |
| --- | --- |
| [Shared designer](shared-designer.md) | All eight workspace circuits, metadata, routing, units and verification |
| [Architecture](architecture.md) | Runtime, ownership and circuit inventory |
| [Archived model catalogue](model-catalogue-archive.md) | Complete 25-model snapshot before datasheet-only pruning |
| [Unified catalogue](catalogue.md) | Model/display/fitting/static schema, synchronous projections and export |
| [Archived fitting seeds](fitting-template-archive.md) | Previous six seeds retained for historical regression inputs |
| [Valve models](models.md) | Model dispatch, units and device definitions |
| [Modelling rationale](modelling-rationale.md) | Owner articles, design intent and implications for model independence |
| [Calculation API](calculation-api.md) | Pure functions, named inputs/results, validation and adapters |
| [Calculations](calculations.md) | Load lines, inverse searches and approximations |
| [Datasheet fitting](modelling.md) | Fitting workflow and data interchange |
| [Development](development.md) | Running and verification |
| [Decisions](decisions.md) | Architectural choices and design direction |

This repository contains the web tools, not Qt code, Arduino firmware or measurement hardware. Historical references to those systems do not establish implemented features or verified interoperability.
