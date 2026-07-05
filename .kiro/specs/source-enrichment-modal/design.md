# Design Document

## Overview

This design addresses three related improvements to the exporter wizard's field mapping step:

1. Rename "Mailout Recipients" labels to "Mailout" in the DataSourceFilterStep
2. Fix source tags so mailout fields display "mailout" (not "messages" or "contact")
3. Enable source enrichment when Mailout is the primary source — specifically allowing Contact fields to be added via the existing AddSourceModal

The changes are localised to three files (DataSourceFilterStep, source-config-utils, exporter-utils) plus a type update to the SelectedField model.

## Architecture

### Current Flow

1. User selects "Mailout" in DataSourceFilterStep → sets `sourceConfig.primarySource = 'messages'`
2. FieldMappingStep calls `getFieldsForSourceConfig(sourceConfig)` → returns `MESSAGES_FIELDS` (source: "messages")
3. Legacy path: `getFieldsForSources(['mailout'])` → returns `MAILOUT_FIELDS` (source: "contact" ← wrong)
4. Source tags display `field.source` directly in the UI

### Target Flow

1. User selects "Mailout" in DataSourceFilterStep → sets `sourceConfig.primarySource = 'messages'` (unchanged)
2. `getFieldsForSourceConfig` detects `primarySource === 'messages'` and returns mailout-specific fields with `source: 'mailout'`
3. AddSourceModal offers "Contacts" as an enrichment when primary source is messages
4. Contact enrichment fields use `source: 'contacts'`
5. Source tags display correctly: "mailout" for primary fields, "contacts" for enrichment fields

### Key Design Decisions

1. **Keep `primarySource: 'messages'` in the SourceConfig** — The existing type system uses `'messages'` as the primary source type. Rather than adding a new `'mailout'` type to `PrimarySourceType`, we'll override the field source tag at the utility level. This avoids a type system migration.

2. **Fix field source at the utility level** — `source-config-utils.ts` will return `source: 'mailout'` for the primary fields when `primarySource === 'messages'`. This is where the display value is determined.

3. **Fix legacy MAILOUT_FIELDS** — Update `exporter-utils.ts` to use `source: 'mailout'` on `MAILOUT_FIELDS`. Requires widening `FieldDefinition.source` type.

4. **Widen SelectedField.source type** — Add `'mailout'` and `'contacts'` to the union type in `automation.ts`. The source-config-utils already uses `source: string` via `SourceFieldDefinition`, so only the legacy path needs the type update.

5. **Contacts enrichment option** — The `AddSourceModal` already supports messages and transactions. Adding contacts as an enrichment option requires adding a "Contacts" category to the modal's checkbox list, conditional on the primary source not being contacts itself.

## Components Changed

### `src/components/wizard/DataSourceFilterStep.tsx`
- Replace 3 occurrences of "Mailout Recipients" with "Mailout"

### `src/utils/source-config-utils.ts`
- Change `getPrimaryFields('messages')` to return fields with `source: 'mailout'` instead of `source: 'messages'`
- Add a `MAILOUT_PRIMARY_FIELDS` array with correct source tags
- Update `getEnrichmentFields` for `entity: 'contacts'` to use `source: 'contacts'`

### `src/utils/exporter-utils.ts`
- Update `MAILOUT_FIELDS` source property from `'contact'` to `'mailout'`

### `src/data/fieldRegistry.ts`
- Widen `FieldDefinition.source` type to include `'mailout'`

### `src/models/automation.ts`
- Widen `SelectedField.source` type to include `'mailout' | 'contacts'`

### `src/components/wizard/AddSourceModal.tsx`
- Add "Contacts" as an enrichment category (visible when primary source is messages)
- Pass `primarySource` prop to conditionally show/hide categories

### `src/components/wizard/SourceChipsRow.tsx`
- Adjust the permanent chip label based on primary source: "Mailout" when primary is messages, "Contacts" when primary is contacts

## Data Model Changes

```typescript
// automation.ts — widen SelectedField.source
export interface SelectedField {
  key: string;
  label: string;
  source: 'contact' | 'treatment' | 'product' | 'event' | 'mailout' | 'contacts';
}

// fieldRegistry.ts — widen FieldDefinition.source  
export interface FieldDefinition {
  key: string;
  label: string;
  source: 'contact' | 'treatment' | 'product' | 'mailout';
  dataType: 'string' | 'number' | 'date' | 'enum';
  enumValues?: string[];
}
```

## Source Config Utils — New Field Array

```typescript
// Mailout primary fields (when primarySource is 'messages')
const MAILOUT_PRIMARY_FIELDS: SourceFieldDefinition[] = [
  { key: 'mailout_id', label: 'Mailout ID', source: 'mailout' },
  { key: 'mailout_name', label: 'Mailout Name', source: 'mailout' },
  { key: 'send_date', label: 'Send Date', source: 'mailout' },
  { key: 'recipient_count', label: 'Recipient Count', source: 'mailout' },
  { key: 'open_rate', label: 'Open Rate', source: 'mailout' },
  { key: 'click_rate', label: 'Click Rate', source: 'mailout' },
];
```

## AddSourceModal Changes

```typescript
interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEnrichments: EnrichmentConfig[];
  primarySource: PrimarySourceType; // NEW — controls which categories are shown
  onConfirm: (newEnrichments: EnrichmentConfig[]) => void;
}
```

The modal will render a "Contacts" category when `primarySource === 'messages'`, allowing the user to add contact fields as enrichment. The existing Messages and Transaction categories remain available.

## SourceChipsRow Changes

The permanent (non-removable) chip should reflect the primary source:
- When `primarySource === 'contacts'` → chip label = "Contacts"
- When `primarySource === 'messages'` → chip label = "Mailout"

## Testing Considerations

- Verify source tags render "mailout" on primary fields when Mailout is selected
- Verify source tags render "contacts" on enrichment fields after adding Contacts
- Verify AddSourceModal shows Contacts category only when primary source is messages
- Verify removing Contacts enrichment chip clears contact fields from selection
- Verify the permanent chip shows "Mailout" (not "Messages") when Mailout is primary source
