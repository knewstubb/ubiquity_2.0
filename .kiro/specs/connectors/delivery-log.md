# Delivery Log — Connectors

> **Feature:** Connectors (Import & Export Automations)
> **Status:** Shipped
> **Last updated:** 2026-08-11
> **Maintained by:** Delivery Lead (Gene)

---

## 2026-08-11 — Spec consolidation and refresh

**Context:** Three separate spec folders (`integrations/`, `connector-data-persistence/`, `exporter-wizard-rework/`) had drifted from the current implementation. The prototype evolved significantly during development, and the specs no longer reflected reality.

**What changed:**
- Renamed `integrations/` to `connectors/` as the canonical spec folder
- Rewrote `requirements.md` to cover both importers and exporters comprehensively
- Rewrote `design.md` to reflect current architecture (6-step exporter, 7-step importer, multi-enrichment support)
- Marked `connector-data-persistence/` and `exporter-wizard-rework/` as SHIPPED and absorbed into main spec
- Created this delivery log

**Decisions made:**
- Consolidated specs rather than maintaining three separate folders — reduces maintenance burden and confusion
- Kept absorbed specs in place with status banners for historical reference rather than deleting
- Updated requirements to use UbiQuity product framing rather than original "wellness spa prototype" language

**Refs:**
- `specs/connector-data-persistence/requirements.md` (absorbed)
- `specs/exporter-wizard-rework/requirements.md` (absorbed)

---

## 2026-06-xx — Exporter wizard rework shipped

**Context:** Original 4-step exporter wizard was enhanced with type selection, column renaming, NZ timezone default, and simplified scheduling.

**What changed:**
- Added `SourceConfig` model with multi-enrichment support
- Expanded to 6-step wizard: File Settings → Data Source → Filter → Export Fields → Schedule → Review
- Added column renaming with validation (max 128 chars, no duplicates)
- Changed default timezone from UTC to Pacific/Auckland
- Added card-based filter builder for filtered exports
- Unified notification pattern across importers and exporters

**Decisions made:**
- No explicit "exporter type" selection step — flow adapts based on source selection
- Multi-enrichment array instead of single enrichment — future-proofs for complex exports
- Full-page wizard instead of modal overlay — better for complex multi-step flows

**Refs:**
- `specs/exporter-wizard-rework/tasks.md` (all tasks complete)

---

## 2026-05-xx — Importer persistence shipped

**Context:** Importer wizard stored configuration in local state only — settings were lost after creation. The settings modal displayed hardcoded values.

**What changed:**
- Added typed `ImporterConfig` model replacing `Record<string, unknown>`
- Wired wizard steps with `value`/`onUpdate` callback pattern
- Added `importer_config` JSONB column to `connectors` table
- Updated `AutomationSettingsModal` to read from database
- Updated seed script with realistic importer configurations

**Decisions made:**
- JSONB column on existing table rather than normalized tables — config is always read/written as a unit
- Callback-based state lifting rather than context — simpler for linear wizard flow

**Refs:**
- `specs/connector-data-persistence/tasks.md` (all tasks complete)

---

## 2026-04-xx — Original exporter prototype shipped

**Context:** Initial implementation of the connector exporter feature as a standalone prototype.

**What changed:**
- Created `WizardModal` with 4-step flow: Data Source → Field Mapping → Output Config → Review
- Implemented `ConnectionsContext` and `ConnectorsContext` for state management
- Added pre-seeded wellness spa data (contacts, treatments, products)
- Created dashboard with expandable connection rows and nested automation cards

**Decisions made:**
- Modal-based wizard (60%×80% viewport) rather than full-page
- Client-side state with localStorage persistence
- Non-functional filters stored but not applied (demo purposes)

**Refs:**
- `specs/connectors/tasks.md` (original implementation plan)

---

## Evolution Summary

| Phase | Key Change | Spec |
|-------|------------|------|
| Initial | 4-step modal exporter wizard | `integrations/` |
| Phase 2 | Importer persistence + typed models | `connector-data-persistence/` |
| Phase 3 | 6-step full-page wizard + multi-enrichment | `exporter-wizard-rework/` |
| Consolidation | Unified spec reflecting current state | `connectors/` |
