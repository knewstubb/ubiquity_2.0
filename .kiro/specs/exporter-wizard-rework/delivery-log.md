# Delivery Log — Exporter Wizard Rework

> Feature: Exporter Wizard Rework
> Status: In Progress
> Last updated: 2026-08-13
> Maintained by: Gene (Delivery Lead)

---

## 2026-08-13 — Chip Styling Revision + Field Count Fix

**Context:** User feedback that darker chip text was too harsh, requested mint styling instead. Also reported Serenity Spa only showing 9 fields despite expansion to 30.

**What changed:**

1. **Reverted chip text colour, added mint backgrounds**
   - Selected fields: `bg-primary/10 border-primary/20 text-primary` (mint tint, teal text)
   - Unselected fields: `bg-primary/5 border-primary/10 text-muted-foreground` (lighter mint, grey text)
   - Provides visual differentiation while maintaining requested mint aesthetic

2. **Fixed 30 fields not refreshing for existing drafts**
   - Root cause: `populateFieldsForTransition()` only repopulated when fields empty or source changed
   - Existing Serenity Spa exporter had 9 fields cached from before expansion
   - Added fifth branch: detect when available field count differs from cached selection and repopulate
   - Resets `columnRenames` when repopulating to avoid stale mappings

**Commits:**
- `c2dbece` — style(exporter): apply mint tint to source chips
- `b6fd9d1` — fix(exporter): refresh fields when available count changes

**Refs:**
- specs/exporter-wizard-rework/

---

## 2026-08-13 — Export Fields UI Improvements

**Context:** User feedback on Export Fields step — chips showing generic "transactions" label, low contrast chips, need to test with many fields.

**What changed:**

1. **Transaction chip shows actual table name** — Changed source tag from generic `'transactions'` to `'txn:{tableId}'` pattern
   - Modified `source-config-utils.ts` to generate dynamic source tags for transaction primary sources
   - The `getSourceDisplayName()` function in `FieldMappingStep.tsx` already resolves `txn:` prefix to table names
   - Now displays "Spa Bookings", "Product Purchases", etc. instead of "transactions"

2. **Increased chip contrast** — Better visibility for source indicator chips
   - Changed from `text-muted-foreground` (zinc-500) to `text-secondary-foreground` (zinc-800)
   - Changed from `font-medium` to `font-semibold`
   - Changed from `border-border/60` to `border-border` (full opacity)
   - Changed from `bg-secondary` to `bg-muted` (same token, clearer intent)

3. **Expanded contact fields to 30** — Test data for "too many fields" scenario
   - Core identity (5): Email, First/Last Name, Phone, Mobile
   - Demographics (5): DOB, Gender, Language, Company, Job Title
   - Address (5): Line 1/2, City, Region, Postal Code
   - Spa-specific (5): Preferred Treatment/Therapist, Allergies, Medical Notes, Contact Method
   - Membership (5): Tier, Expiry, Loyalty Points, Lifetime Value, Referral Source
   - System (5): Status, Segment, Source, Created/Updated timestamps

4. **Added scroll capability** — Field list now scrollable when content exceeds viewport
   - Added `max-h-[400px] overflow-y-auto` wrapper around field rows
   - Select All header remains fixed outside scroll container

**Design decisions documented:**
- **Export fields limit:** Recommended 50 (soft warning) / 100 (hard cap) based on Excel usability, industry practice, SME context
- **Column name length:** Recommended min 1, max 64 chars to align with PostgreSQL/MySQL constraints

**Refs:**
- specs/exporter-wizard-rework/

---

## 2026-08-13 — Design System Updates (Icon Standardisation & Focus Ring)

**Context:** User requested standardisation of transaction icons and adjustment of focus ring styling across the system.

**What changed:**

1. **Transaction Icon Standardisation** — Replaced all transaction-related icons with `Receipt` from Phosphor Icons
   - `AutomationCard.tsx`: NewspaperClipping → Receipt
   - `DataSourceFilterStep.tsx`: ShoppingCart → Receipt (4 usages)
   - `BranchConfig.tsx`: ShoppingCart → Receipt
   - Already correct: `JourneyCard.tsx`, `EnrichmentSection.tsx`, `PrimarySourceSelector.tsx`

2. **Focus Ring Styling** — Changed from teal/primary colour to neutral grey
   - Light mode: zinc-300 (`#D4D4D8`)
   - Dark mode: zinc-500 (`#71717A`)
   - Updated `--ring` and `--ring-shadow` tokens in `globals.css`

**Decisions made:**
- Receipt icon chosen as "universally understood as a record of something that happened" — alternatives considered: ArrowsLeftRight (data exchange), Activity (event stream), Lightning (real-time), ShoppingCart (too commerce-specific)
- Focus ring kept (not removed entirely) but made neutral — user initially requested removal, then changed to "bring it back just make it more neutral"

**Commits:**
- `eb3829b` style(AutomationCard): replace NewspaperClipping with Receipt icon for transactions
- `620abca` style(tokens): remove focus ring highlight from design system (superseded)
- `ef3eb63` style(tokens): change focus ring from teal to neutral grey
- `6a4e3cf` style(tokens): lighten focus ring to zinc-300 in light mode
- `5ad4ddf` style(icons): replace ShoppingCart with Receipt for transactional data

**Refs:**
- specs/exporter-wizard-rework/

---
