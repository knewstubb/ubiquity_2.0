# Tasks

## Task 1: Update Asset model and create seed data

- [x] 1.1 Update `src/models/asset.ts` — replace existing interface with extended version: add `AssetType` and `AssetScope` type aliases, add `scope`, `campaignId`, and `colourValue` fields, expand `type` union to `'image' | 'colour' | 'font' | 'footer'`, remove `usageCount` and `template`/`snippet` types
- [x] 1.2 Create `src/data/assets.ts` with seed data containing sample assets across all three scopes (global, campaign, account) and all four types (image, colour, font, footer), referencing existing account IDs from `src/data/accounts.ts` and campaign IDs from `src/data/campaigns.ts`

## Task 2: Create AssetsContext provider

- [x] 2.1 Create `src/contexts/AssetsContext.tsx` with `AssetsContextValue` interface (assets, addAsset, deleteAsset, getAssetsByScope)
- [x] 2.2 Initialise state from `src/data/assets.ts` seed data
- [x] 2.3 Implement localStorage persistence under key `ubiquity-assets` with fallback to seed data on parse failure
- [x] 2.4 Implement `addAsset` (generates ID, sets createdAt, adds to state and persists)
- [x] 2.5 Implement `deleteAsset` (removes from state and persists)
- [x] 2.6 Implement `getAssetsByScope(scope, scopeId?)` — returns global assets, or campaign/account-filtered assets
- [x] 2.7 Wrap `AssetsContext.Provider` around the app tree in `src/App.tsx` alongside existing providers

## Task 3: Create ScopeSelector component

- [x] 3.1 Create `src/components/assets/ScopeSelector.tsx` and `ScopeSelector.module.css`
- [x] 3.2 Render three segmented tabs: Global, Campaign, Account — teal text for active, grey-100 background for inactive
- [x] 3.3 Wire tab clicks to `onScopeChange` callback

## Task 4: Create AssetCard component

- [x] 4.1 Create `src/components/assets/AssetCard.tsx` and `AssetCard.module.css`
- [x] 4.2 Render type-specific preview: placeholder image div (image), colour swatch div with `colourValue` background (colour), "Aa" sample text (font), Phosphor `FileText` icon (footer)
- [x] 4.3 Render asset name, type badge chip, scope indicator label, and formatted creation date
- [x] 4.4 Wire card body click to `onClick` prop

## Task 5: Create TypeFilter component

- [x] 5.1 Create `src/components/assets/TypeFilter.tsx` and `TypeFilter.module.css`
- [x] 5.2 Render horizontal row of chip buttons for asset types, supporting multi-select toggle with OR logic
- [x] 5.3 Wire chip clicks to `onToggle` callback

## Task 6: Create SearchInput component

- [x] 6.1 Create `src/components/assets/SearchInput.tsx` and `SearchInput.module.css`
- [x] 6.2 Render text input with Phosphor `MagnifyingGlass` icon prefix and placeholder text
- [x] 6.3 Wire input changes to `onChange` callback

## Task 7: Create CampaignPicker component

- [x] 7.1 Create `src/components/assets/CampaignPicker.tsx` and `CampaignPicker.module.css`
- [x] 7.2 Render a dropdown select populated from `CampaignsContext.campaigns`
- [x] 7.3 Wire selection change to `onCampaignChange` callback, default to first campaign if none selected

## Task 8: Create UploadDialog component

- [x] 8.1 Create `src/components/assets/UploadDialog.tsx` and `UploadDialog.module.css`
- [x] 8.2 Render modal with name input (required), type dropdown (image/colour/font/footer), scope radio group (Global/Campaign/Account)
- [x] 8.3 Conditionally render campaign picker dropdown when scope is "campaign"
- [x] 8.4 Conditionally render hex colour input when type is "colour"
- [x] 8.5 Implement name validation — disable Upload button when name is empty or whitespace-only, show inline validation message
- [x] 8.6 Wire Cancel/Upload buttons and backdrop click to close

## Task 9: Create AssetDetailPanel component

- [x] 9.1 Create `src/components/assets/AssetDetailPanel.tsx` and `AssetDetailPanel.module.css`
- [x] 9.2 Render slide-in side panel with larger type-specific preview, asset name heading, type/scope/date metadata
- [x] 9.3 Render Delete button that triggers a confirmation dialog (reuse DeleteConfirmDialog pattern)
- [x] 9.4 Render Close button (X icon) and support closing by clicking outside the panel

## Task 10: Create AssetsPage

- [x] 10.1 Create `src/pages/AssetsPage.tsx` and `AssetsPage.module.css`
- [ ] 10.2 Render `PageShell` with "Assets" title and "Upload Asset" button in action slot
- [ ] 10.3 Render `ScopeSelector` tabs with state management for `activeScope`
- [ ] 10.4 Conditionally render `CampaignPicker` when Campaign tab is active
- [ ] 10.5 Render `SearchInput` and `TypeFilter` row
- [ ] 10.6 Implement filtering pipeline: scope filter → type filter → search filter → rendered AssetCard grid
- [ ] 10.7 Wire AssetCard clicks to open `AssetDetailPanel` with selected asset
- [ ] 10.8 Wire `UploadDialog` — on submit, call `AssetsContext.addAsset` with generated ID and current timestamp
- [ ] 10.9 Wire asset deletion from `AssetDetailPanel` through `AssetsContext.deleteAsset`
- [ ] 10.10 Implement empty state when no assets match the current filter combination
- [ ] 10.11 Use `useAccount()` for account-scoped filtering (master account shows all account assets)

## Task 11: Add route and navigation

- [x] 11.1 Add `<Route path="/content/assets" element={<AssetsPage />} />` to `src/App.tsx` and import `AssetsPage`
- [x] 11.2 Add `{ label: 'Assets', path: '/content/assets' }` to the Content sub-items in `src/components/layout/AppNavBar.tsx`

## Task 12: Write unit tests

- [ ] 12.1 Create `src/components/assets/__tests__/AssetCard.test.tsx` — renders name, type badge, scope label, date; correct preview per type; click calls onClick
- [ ] 12.2 Create `src/components/assets/__tests__/ScopeSelector.test.tsx` — renders three tabs; clicking tab calls onScopeChange; active tab styling
- [ ] 12.3 Create `src/components/assets/__tests__/UploadDialog.test.tsx` — validates name; calls onUpload with metadata; shows campaign picker for campaign scope; shows colour input for colour type; closes on cancel
- [ ] 12.4 Create `src/components/assets/__tests__/AssetDetailPanel.test.tsx` — displays metadata; delete triggers confirmation; close works

## Task 13: Write property-based tests

- [ ] 13.1 Create `src/components/assets/__tests__/TypeFilter.property.test.ts` — Property 3: type filter with OR logic (100+ iterations)
- [ ] 13.2 Create `src/contexts/__tests__/AssetsContext.property.test.ts` — Property 4: valid upload adds asset; Property 5: empty names rejected; Property 6: deletion removes asset; Property 8: localStorage round-trip
- [ ] 13.3 Create `src/components/assets/__tests__/AssetFiltering.property.test.ts` — Property 1: scope filter; Property 9: search filter case-insensitive; Property 10: combined filters produce intersection; Property 11: master account shows all account assets
- [ ] 13.4 Create generators: `arbAsset()`, `arbAssetType()`, `arbAssetScope()`, `arbAccountId()`, `arbSearchQuery()`
