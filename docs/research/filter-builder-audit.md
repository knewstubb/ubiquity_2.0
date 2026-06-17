# UbiQuity Filter Builder — Research Audit

## Purpose

This document maps how filters work in the current UbiQuity platform (staging build 1.179.0.1) to inform the design of UbiQuity 2.0's new filter builder. The focus is on filter conditions available per data source and field type — particularly transactional data filtering which uses a fundamentally different pattern.

## Source

Audited via the staging environment: `stagingengage.ubiquity.nz/filter/Edit/{filterId}`

---

## Architecture Overview

The filter builder uses a **stepped modal** with a dynamic number of steps depending on the selected statement category and condition:

### Standard Flow (Contact Fields)
1. **Select a statement** — pick a data source category, then a field
2. **Select a condition** — operator dropdown (varies by field type)
3. **Enter a value** — input appropriate to the field type
4. **And** — chain additional filter conditions

### Transactional Flow (4 steps)
1. **Select a statement** — Database → Transactional Databases → specific table
2. **Select a condition** — has transactions / has no transactions / has matching transactions / does not have matching transactions
3. **Find me transactions where** — sub-filter on transaction record fields (with and/or chaining)
4. **And those transactions have...** — additional conditions on the same records (with and/or chaining)

This is the key architectural difference: **transactional filters are relationship-based** (does the contact have matching records?) rather than field-based (what is the value of this field?).

---

## Statement Categories (Top-Level)

| Category | Description |
|----------|-------------|
| **Database** | Contact fields (custom + system), Imports, Transactional Databases |
| **Forms** | Form submission data |
| **Mailout Folders** | Email engagement data |
| **Surveys** | Survey response data |
| **Events** | Event participation data |
| **TXT Programmes** | SMS programme data |
| **Filters** | Existing saved filters (composition) |

---

## Database Category — Sub-categories

When "Database" is expanded, it reveals:

### Contact Fields (User-Defined)
The specific fields depend on the account's schema. In the test account:
- Email, MobileNumber, Notes, DOB, WholeNumber, Time, DateTime, Decimal, Avatar, Alternative Email, Test2, First Name, GUID, Is Member

### Channel Opt-In Fields
- GNA TXT, GNA TXT Date, Chenchen Test Opt In, Spark Channel Parent Account Opt In (etc.)
- Opted Out, Opt Out Date, GNA, GNA Date

### Sub-Categories (Expandable)
- **Imports** — filter by import batch
- **System Fields** — built-in system fields
- **Archived Fields** — deprecated/hidden fields
- **Transactional Databases** — expandable list of transaction tables (Purchase, AAM_WELCOME, Car Insurance)

---

## Conditions by Field Type

### Text Fields (Email, Notes, First Name, etc.)
| Condition | Value Input |
|-----------|-------------|
| equals | Text input |
| is not equal to | Text input |
| is in | Text input (comma-separated list) |
| is not in | Text input (comma-separated list) |
| starts with | Text input |
| ends with | Text input |
| contains | Text input |
| does not contain | Text input |

**Field metadata shown:** Description, Type ("Email Address" / "Text"), Required (Yes/No)

### Date Fields (DOB, Opt Out Date, GNA Date, etc.)
| Condition | Value Input |
|-----------|-------------|
| is blank | None |
| is not blank | None |
| equals | Date qualifier + date picker |
| is not equal to | Date qualifier + date picker |
| is after | Date qualifier + date picker |
| is after or equal to | Date qualifier + date picker |
| is before | Date qualifier + date picker |
| is before or equal to | Date qualifier + date picker |
| is between | Date range picker |
| is in | Date list |
| is not in | Date list |

**Date qualifiers (secondary dropdown in step 3):**
- a specific date
- the same day as
- the anniversary
- before
- before the anniversary
- after
- after the anniversary

**Field metadata shown:** Type ("Date"), Required (Yes/No)

### Number Fields (WholeNumber, Decimal)
| Condition | Value Input |
|-----------|-------------|
| is blank | None |
| is not blank | None |
| equals | Number input |
| is not equal to | Number input |
| is greater than | Number input |
| is greater than or equal to | Number input |
| is less than | Number input |
| is less than or equal to | Number input |
| is in | Number list |
| is not in | Number list |

**Field metadata shown:** Type ("Whole Number" / "Decimal"), Required (Yes/No)

### Boolean Fields (Is Member, Opted Out, Opt-In fields)
*Not directly observed but likely:*
| Condition | Value Input |
|-----------|-------------|
| equals | True/False toggle or dropdown |

---

## Transactional Database Filtering — Deep Dive

This is architecturally different from contact field filtering. Filters are applied at the **relationship level** (does the contact have records in this table?) rather than at the field level.

### Top-Level Conditions (Step 2)

| Condition | Meaning | Subsequent Steps |
|-----------|---------|-----------------|
| has transactions | Contact has ≥1 record in this table | None (step 3 not needed) |
| has no transactions | Contact has 0 records in this table | None (step 3 not needed) |
| has matching transactions | Contact has records matching criteria | Steps 3 + 4 appear |
| does not have matching transactions | Contact has no records matching criteria | Steps 3 + 4 appear |

### Sub-Filter (Steps 3 + 4) — "has matching transactions"

When "has matching transactions" or "does not have matching transactions" is selected, two new steps appear allowing field-level filtering on the transaction records:

**Step 3: "Find me transactions where"**
- A field dropdown showing all columns in the transaction table
- A condition dropdown (varies by field type, same operators as above)
- A value input
- "and..." button to add additional conditions (AND logic)
- "Delete this condition" button per row

**Step 4: "And those transactions have..."**
- Same structure as Step 3
- Allows additional AND/OR conditions

### Transaction Table Fields (Example: "Purchase" table)

| Field | Likely Type |
|-------|-------------|
| Purchase ID | Number |
| Price | Decimal |
| Quantity | Number |
| Name | Text |
| ID | Number (system) |
| Transaction ID | Text/Number |
| Reference ID | Text |
| Create Date | DateTime |
| Create Date - Date | Date (date part only) |
| Create Date - Time | Time (time part only) |
| Last Modified | DateTime |
| Last Modified - Date | Date |
| Last Modified - Time | Time |
| Source | Text |
| Version | Number |

### Condition Operators for Transaction Fields

For numeric fields within the transactional sub-filter:
- equals, is not equal to, is greater than, is greater than or equal to, is less than, is less than or equal to, is in, is not in

For text fields within the transactional sub-filter:
- Same as contact text fields (equals, contains, starts with, etc.)

---

## Filter Composition

### AND/OR Logic
- Multiple conditions within a filter are combined with implicit AND logic
- The "And" section (step 4 in standard flow) allows adding more conditions
- Within transactional sub-filters, conditions can be chained with "and..." buttons

### Filter-on-Filter (Composition)
- The "Filters" top-level category allows referencing existing saved filters
- This enables building complex queries by combining simpler named filters

---

## Key Observations for UbiQuity 2.0 Design

1. **Transactional filtering is relationship-based, not field-based.** You don't ask "what is the value of Purchase.Price?" — you ask "does this contact have purchases where Price > 100?" This is a fundamentally different mental model.

2. **The stepped wizard is linear.** Each condition is built one step at a time. There's no visual preview of the full filter expression until you save and return to the filter summary. The new builder should show the full expression as it's being built.

3. **Field types determine available operators.** Text gets string operations, dates get temporal operations + qualifiers (anniversary, relative), numbers get comparison operations. This type-to-operator mapping must be preserved.

4. **Date qualifiers add relative logic.** "the anniversary" and "before the anniversary" enable recurring date filters (e.g. birthday campaigns). This is unique to dates and should be surfaced in the new builder.

5. **Transactional sub-filters are nested.** The "has matching transactions" condition opens a sub-query builder within the modal. The new builder needs to handle this nested structure — perhaps as an indented card within the main filter expression.

6. **All filters are contact-centric.** Even transactional filters ultimately produce a set of contacts. The question is always "which contacts match?" — never "which transactions match?" independently.

7. **No visual grouping (AND/OR groups).** The current builder doesn't expose explicit AND/OR group brackets — conditions are implicitly AND. The new builder should make grouping explicit if we want OR logic.

8. **Forms, Mailouts, Surveys, Events, TXT** all likely follow similar patterns to transactional data (relationship-based: "has submitted form X", "received mailout Y", etc.) but I didn't drill into each one during this audit.

---

## Recommendations for New Filter Builder

1. **Card-based conditions** that show the full expression visually (field → operator → value) rather than a stepped wizard
2. **Explicit AND/OR grouping** with nested card groups
3. **Transactional filters as nested cards** — "Purchase where [Price > 100 AND Quantity ≥ 2]" shown as an indented sub-group
4. **Type-aware operator selection** — when a field is selected, only show valid operators for that type
5. **Relative date options** preserved — anniversary, before/after relative dates, "in the last N days"
6. **Live count preview** — show matching contact count as conditions are added (the current system shows this in the background table)
7. **Filter composition** — ability to reference saved filters as conditions (AND with existing filter)
