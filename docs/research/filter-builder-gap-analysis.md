# Filter Builder — Gap Analysis (Open Items)

## Purpose

Condensed gap analysis showing only **open and partial gaps** between the prototype filter builder and the production requirements (Platform Filter Builder spec, Design Brief, Technical Input). Closed gaps have been removed.

Last updated: 25 June 2026

---

## Open Feature Gaps

### Must address for production readiness

| # | Capability | Status | Gap |
|---|---|---|---|
| 1 | **Filter composition** — reference saved filters as conditions | ⚠️ Partial | "Saved Filters" source category exists in demo with named filters (Gold Members, Active Last 90 Days, etc.) using boolean operators. Full composition (expanding referenced filters inline, circular reference detection) is a backend concern. Prototype demonstrates the UX pattern. |
| 2 | **Hard-block at limits** — disable add actions at max | ❌ Open | Bottom bar shows red count at 100% but doesn't actually disable "+ Add condition" / "+ Group" buttons. Should prevent adding beyond 25 conditions / 10 groups. |
| 3 | **Paginated data preview** — see matching records | ❌ Open | Users can't verify filter correctness by scanning actual records. Separate component that consumes the filter output. |
| 4 | **Self-reference detection** — prevent circular filter composition | ❌ Open | When composing filters, need to detect and prevent circular references. Backend validation concern. |

### Partial — architecture supports it, demo config incomplete

| # | Capability | Status | Gap |
|---|---|---|---|
| 8 | **Email/SMS as relationship-based** | ⚠️ Partial | Demo models email/SMS with field-based filtering (was_opened: boolean). Should also offer `sourceType: 'transactional'` sub-sources for "Has received" / "Has opened" relationship pattern. Architecture supports it — config change only. |
| 9 | **Forms source category** | ⚠️ Partial | Not in demo config. Architecture supports it. Add a `SourceCategoryConfig` entry with `sourceType: 'transactional'` for "Has submitted form X" pattern. |
| 10 | **Events source category** | ⚠️ Partial | Same as Forms — not demonstrated but architecturally supported. |
| 11 | **Surveys source category** | ⚠️ Partial | Same pattern. |
| 12 | **Push notifications** | ⚠️ Partial | Same pattern. |
| 13 | **Import batch filtering** | ⚠️ Partial | "Contacts from import batch X" — needs a batch picker, not free text. Partially supported. |
| 14 | **Mail Events as separate entity** | ⚠️ Partial | Brief specifies Mail Events (open/click/bounce, date, link clicked) as separate from Recipients. Could be a sub-source under Email. |

---

## Open Operator Gaps

| Operator | Data Type | Priority | Notes |
|---|---|---|---|
| `not_equals` | Date | Important | Exists in legacy. Rarely used but should be added. |
| `after_or_equal` | Date | Important | Legacy distinguishes "before" from "before or equal to". |
| `before_or_equal` | Date | Important | Same as above. |
| `is_in` / `is_not_in` | Date | Low | Date lists. Unusual UX. Defer. |

---

## Open UX Gaps

| # | Gap | Severity | Notes |
|---|---|---|---|
| 1 | **No "Apply" state transition** | Low | Prototype uses immediate-apply model (condition applied on confirm). Technical Input's state machine assumes explicit "Apply" step. Acceptable for exporter workflow; may need revisiting for other hosts. |
| 2 | **No field metadata display** | Low | Legacy shows field description and required status. Prototype shows type badge only. Power user feature. |
| 3 | **Incomplete condition indicator** | Low | Partially-built conditions in edit mode don't show a visual "incomplete" indicator. Confirm is disabled but no inline warning. |
| 4 | **Execution timeout handling** | Low | Backend integration concern. "This filter is too slow — try simplifying" message not implemented. |

---

## Open Design Decisions to Resolve

| Decision | Concern | Recommendation |
|---|---|---|
| **`__relationship__` sentinel field value** | Magic string `'__relationship__'` for transactional conditions could confuse filter JSON consumers. | Consider a `conditionType: 'field' \| 'relationship'` discriminator, or make `field` nullable for relationship conditions. |
| **Email/SMS category pattern** | Currently field-based. Research audit says they should follow relationship-based pattern ("has received", "has opened"). | Add `sourceType: 'transactional'` to Email/SMS sub-sources as a P1 config change. |

---

## Open Questions

| # | Question | Context |
|---|---|---|
| Q2 | **How will filter composition work at the backend?** Saved filter expanded inline at execution, or treated as a boolean condition? | Determines backend handling when a "Saved Filters" condition is part of a filter definition. |
| Q6 | **What JSON structure does the backend expect?** | Prototype produces `FilterGroup` → `CardFilterRow` tree. Aligned with `FilterDefinition` protobuf? Or translation layer needed? |

---

## Prioritised Actions

### P0 — Next iteration

| # | Action | Effort | Source |
|---|---|---|---|
| 1 | Hard-block add actions at condition/group limits | Small | Technical Input |
| 2 | Self-reference detection for filter composition | Medium | Feature gap (backend) |

### P1 — Following iteration

| # | Action | Effort | Source |
|---|---|---|---|
| 3 | Add `not_equals`, `before_or_equal`, `after_or_equal` to `DATE_OPERATORS` | Small | Operator gap |
| 4 | Add Forms/Events/Surveys source categories to demo | Small (config) | Data domain gap |
| 5 | Add relationship-based operators to Email/SMS categories | Small (config) | Design decision |
| 6 | Data preview component | Large | UX gap |

### P2 — Future

| # | Action | Effort | Source |
|---|---|---|---|
| 7 | Execution timeout handling UX | Small | UX gap |
| 8 | Field metadata display (description, required) | Small | UX gap |

---

## Design Brief Compliance

| Must-have Requirement | Status |
|---|---|
| Add a condition (field → operator → value) | ✅ |
| AND/OR toggle within blocks | ✅ |
| Add another block | ✅ |
| Remove conditions and blocks | ✅ |
| Disable/enable conditions | ✅ |
| Save and load filters | ✅ Save mock + "Saved Filters" source category for load/compose |
| Result count feedback | ✅ Mock implemented (indicative count sufficient for prototype) |
| Validation feedback | ✅ Partial |
| Complexity warning | ✅ |

---

## Platform Filter Builder Spec Alignment

| Spec Requirement | Prototype Status |
|---|---|
| Filter construction (blocks + conditions + AND/OR) | ✅ |
| Schema discovery (entities, fields, operators) | ✅ via `SourceCategoryConfig` |
| Condition types (equality, comparison, text, date, IN, null, aggregate) | ✅ |
| Saved filters (save, list, load, update, delete) | ✅ Save mock + Saved Filters source category for load/compose |
| Filter validation against schema | ✅ Partial (inline validation) |
| Complexity limits (configurable per account) | ✅ Visual (25/10 limits) |
| Entity coverage: Contacts | ✅ |
| Entity coverage: Transactions | ✅ |
| Entity coverage: Mail Recipients | ⚠️ Partial (field-based, not relationship-based) |
| Entity coverage: Mail Events | ⚠️ Partial (not separately modelled) |
| Extensibility (add entities without core changes) | ✅ Config-driven |
| JSON output (FilterDefinition contract) | ✅ `FilterGroup` tree serialises cleanly |
| Statelessness (browser holds state until save) | ✅ Controlled component |
