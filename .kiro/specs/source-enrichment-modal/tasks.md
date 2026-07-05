# Tasks

## Task 1: Rename "Mailout Recipients" to "Mailout"

- [ ] 1.1 In `src/components/wizard/DataSourceFilterStep.tsx`, replace the label "Mailout Recipients" with "Mailout" on the unselected card grid SelectorCard (line ~419)
- [ ] 1.2 Replace the label "Mailout Recipients" with "Mailout" on the selected card grid SelectorCard (line ~478)
- [ ] 1.3 Replace the heading "Mailout Recipients" with "Mailout" in the confirmation summary view (line ~524)

## Task 2: Widen source type unions

- [ ] 2.1 In `src/models/automation.ts`, update `SelectedField.source` to `'contact' | 'treatment' | 'product' | 'event' | 'mailout' | 'contacts'`
- [ ] 2.2 In `src/data/fieldRegistry.ts`, update `FieldDefinition.source` to `'contact' | 'treatment' | 'product' | 'mailout'`

## Task 3: Fix source tags for mailout fields

- [ ] 3.1 In `src/utils/exporter-utils.ts`, update all `MAILOUT_FIELDS` entries to use `source: 'mailout'` instead of `source: 'contact'`
- [ ] 3.2 In `src/utils/source-config-utils.ts`, add a `MAILOUT_PRIMARY_FIELDS` array with 6 fields (Mailout ID, Mailout Name, Send Date, Recipient Count, Open Rate, Click Rate) all with `source: 'mailout'`
- [ ] 3.3 Update `getPrimaryFields` in `source-config-utils.ts` to return `MAILOUT_PRIMARY_FIELDS` when `primarySource === 'messages'`
- [ ] 3.4 Update `getEnrichmentFields` for `entity: 'contacts'` to set `source: 'contacts'` on the returned fields (not 'contacts' from `getPrimaryFields`)

## Task 4: Update SourceChipsRow for mailout context

- [ ] 4.1 In `src/components/wizard/SourceChipsRow.tsx`, add a `primarySource` prop to the component interface
- [ ] 4.2 Change the permanent chip label from hardcoded "Contacts" to a conditional: "Mailout" when `primarySource === 'messages'`, "Contacts" otherwise
- [ ] 4.3 Update `FieldMappingStep.tsx` to pass `primarySource` to `SourceChipsRow`

## Task 5: Add Contacts enrichment to AddSourceModal

- [ ] 5.1 In `src/components/wizard/AddSourceModal.tsx`, add a `primarySource` prop to `AddSourceModalProps`
- [ ] 5.2 Add a "Contacts" category section that renders when `primarySource === 'messages'` (similar structure to existing Messages section)
- [ ] 5.3 Set field count indicator for Contacts (7 fields, matching CONTACTS_FIELDS in source-config-utils)
- [ ] 5.4 Update `handleDone` to create a `{ entity: 'contacts' }` enrichment config when the contacts key is selected
- [ ] 5.5 Update `FieldMappingStep.tsx` to pass `primarySource` from `draft.sourceConfig` to `AddSourceModal`

## Task 6: Verify integration and build

- [ ] 6.1 Run the build (`npm run build`) to confirm no type errors from the widened unions
- [ ] 6.2 Manually verify in browser: select Mailout as data source → confirm field mapping shows "mailout" source tags
- [ ] 6.3 Manually verify: click "+ Add source" → modal shows Contacts option → add it → verify "contacts" source tags appear on enrichment fields
- [ ] 6.4 Manually verify: remove Contacts enrichment chip → contact fields removed from list
