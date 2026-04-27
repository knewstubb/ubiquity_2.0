# Tasks

## Task 1: Create CampaignsContext provider

- [x] 1.1 Create `src/contexts/CampaignsContext.tsx` with `CampaignsContextValue` interface (campaigns, campaignJourneys, CRUD methods, getJourneysForCampaign)
- [x] 1.2 Initialise state from `src/data/campaigns.ts` seed data (both campaigns and journeys arrays)
- [x] 1.3 Implement localStorage persistence under key `ubiquity-campaigns` with fallback to seed data on parse failure
- [x] 1.4 Implement `addCampaign`, `updateCampaign`, `deleteCampaign` (cascade-deletes associated journeys)
- [x] 1.5 Implement `addJourney` (also updates parent campaign's `journeyIds`), `updateJourney`, `deleteJourney` (also updates parent campaign's `journeyIds`)
- [x] 1.6 Implement `getJourneysForCampaign` helper that filters `campaignJourneys` by `campaignId`
- [x] 1.7 Wrap `CampaignsContext.Provider` around the app tree in `src/App.tsx` alongside existing providers

## Task 2: Create shared campaign components

- [x] 2.1 Create `src/components/campaign/BreadcrumbBar.tsx` and `BreadcrumbBar.module.css` — renders breadcrumb items with `>` separators, items with `to` prop are React Router `<Link>` elements, last item is plain text
- [x] 2.2 Create `src/components/campaign/TagFilter.tsx` and `TagFilter.module.css` — renders horizontal row of chip buttons, supports multi-select toggle, calls `onToggle(tag)` callback
- [x] 2.3 Create `src/components/campaign/DeleteConfirmDialog.tsx` and `DeleteConfirmDialog.module.css` — generic confirmation dialog accepting `itemName`, `itemType` ('campaign' | 'journey'), `onConfirm`, `onCancel`

## Task 3: Create CampaignFolderCard component

- [x] 3.1 Create `src/components/campaign/CampaignFolderCard.tsx` and `CampaignFolderCard.module.css`
- [x] 3.2 Render Phosphor `Folder` icon (duotone, teal), campaign name, journey count label, status badge
- [x] 3.3 Integrate existing `OverflowMenu` component with Rename and Delete menu items
- [x] 3.4 Implement inline rename mode — clicking Rename shows a text input pre-filled with current name, Enter/blur confirms, Escape cancels
- [x] 3.5 Wire card body click to `onClick` prop (overflow menu trigger stops propagation)

## Task 4: Create JourneyCard component

- [x] 4.1 Create `src/components/campaign/JourneyCard.tsx` and `JourneyCard.module.css`
- [x] 4.2 Render type-specific Phosphor icon (`HandWaving` for welcome, `ArrowsClockwise` for re-engagement, `Receipt` for transactional, `Megaphone` for promotional), journey name, type label, status badge, entry count
- [x] 4.3 Render optional `campaignName` subtitle when provided (for JourneysPage cross-campaign view)
- [x] 4.4 Integrate existing `OverflowMenu` with Rename and Delete menu items
- [x] 4.5 Implement inline rename mode (same pattern as CampaignFolderCard)
- [x] 4.6 Wire card body click to `onClick` prop

## Task 5: Create dialog components

- [x] 5.1 Create `src/components/campaign/CreateCampaignDialog.tsx` and `CreateCampaignDialog.module.css` — modal with name input (required), goal textarea (optional), Cancel/Create buttons, backdrop click closes
- [x] 5.2 Implement name validation — disable Create button when name is empty or whitespace-only, show inline validation message
- [x] 5.3 Create `src/components/campaign/CreateJourneyDialog.tsx` and `CreateJourneyDialog.module.css` — modal with name input (required), type dropdown (4 journey types), Cancel/Create buttons
- [x] 5.4 Implement name validation for CreateJourneyDialog (same pattern as CreateCampaignDialog)

## Task 6: Redesign CampaignsPage as folder grid

- [x] 6.1 Replace `DataTable` in `src/pages/CampaignsPage.tsx` with responsive CSS Grid of `CampaignFolderCard` components
- [x] 6.2 Update `CampaignsPage.module.css` with grid layout (auto-fill columns, min 280px, gap 16px)
- [x] 6.3 Wire "New Campaign" button in `PageShell` action slot to open `CreateCampaignDialog`
- [x] 6.4 Implement campaign creation — generate ID, set status "draft", add to `CampaignsContext`, close dialog
- [x] 6.5 Wire CampaignFolderCard `onClick` to `navigate(`/automations/campaigns/${id}`)`
- [x] 6.6 Wire rename and delete actions through `CampaignsContext` (delete shows `DeleteConfirmDialog` first)
- [x] 6.7 Implement empty state when no campaigns match account filter
- [x] 6.8 Use `useAccount().filterByAccount` to scope campaigns to active account

## Task 7: Create CampaignDetailPage

- [x] 7.1 Create `src/pages/CampaignDetailPage.tsx` and `CampaignDetailPage.module.css`
- [x] 7.2 Read `campaignId` from URL params, look up campaign from `CampaignsContext`, show "Campaign not found" if invalid
- [x] 7.3 Render `PageShell` with campaign name as title, "Create Journey" button in action slot
- [x] 7.4 Render `BreadcrumbBar` with items: `[{ label: 'Campaigns', to: '/automations/campaigns' }, { label: campaign.name }]`
- [x] 7.5 Derive distinct journey types from campaign's journeys, render `TagFilter`
- [x] 7.6 Implement tag filter state — `useState<string[]>([])` for selected tags, filter journeys by selected types (OR logic, empty = all)
- [x] 7.7 Render filtered journeys as `JourneyCard` grid (same CSS grid pattern as CampaignsPage)
- [x] 7.8 Wire JourneyCard `onClick` to `navigate(`/automations/journeys/${id}`)`
- [x] 7.9 Wire journey rename and delete through `CampaignsContext` (delete shows `DeleteConfirmDialog`, also calls `JourneysContext.deleteJourney`)
- [x] 7.10 Implement journey creation — open `CreateJourneyDialog`, on submit: add journey metadata to `CampaignsContext`, add journey definition to `JourneysContext`, navigate to canvas
- [x] 7.11 Implement empty state when campaign has no journeys
- [x] 7.12 Use `useAccount().filterByAccount` to scope journeys to active account

## Task 8: Add campaign detail route

- [x] 8.1 Add `<Route path="/automations/campaigns/:campaignId" element={<CampaignDetailPage />} />` to `src/App.tsx`
- [x] 8.2 Import `CampaignDetailPage` in `App.tsx`

## Task 9: Redesign JourneysPage as card grid

- [x] 9.1 Replace `DataTable` in `src/pages/JourneysPage.tsx` with responsive CSS Grid of `JourneyCard` components
- [x] 9.2 Pass `campaignName` prop to each JourneyCard (look up from `CampaignsContext`)
- [x] 9.3 Add `TagFilter` for filtering by journey type (same pattern as CampaignDetailPage)
- [x] 9.4 Wire JourneyCard `onClick` to `navigate(`/automations/journeys/${id}`)`
- [x] 9.5 Update `JourneysPage.module.css` with grid layout
- [x] 9.6 Use `useAccount().filterByAccount` to scope journeys to active account
- [x] 9.7 Remove the existing create journey dialog from JourneysPage (creation now happens within campaign detail)

## Task 10: Write property-based tests

- [x] 10.1 Install `fast-check` as a dev dependency
- [x] 10.2 Create `src/components/campaign/__tests__/TagFilter.property.test.ts` — Property 8: tag filter shows distinct types and filters correctly (100+ iterations)
- [x] 10.3 Create `src/contexts/__tests__/CampaignsContext.property.test.ts` — Property 9: creating campaign with valid name adds draft campaign; Property 10: empty/whitespace names rejected; Property 12: rename updates name in state; Property 13: account filter scopes campaigns
- [x] 10.4 Create generators: `arbCampaign()`, `arbJourney(campaignId)`, `arbJourneyType()`, `arbAccountId()`

## Task 11: Write unit tests

- [x] 11.1 Create `src/components/campaign/__tests__/CampaignFolderCard.test.tsx` — renders all fields, overflow menu opens, inline rename works, click navigates
- [x] 11.2 Create `src/components/campaign/__tests__/JourneyCard.test.tsx` — renders all fields, correct icon per type, optional campaign name subtitle, overflow menu, click navigates
- [x] 11.3 Create `src/components/campaign/__tests__/BreadcrumbBar.test.tsx` — renders items with separators, links navigate
- [x] 11.4 Create `src/components/campaign/__tests__/CreateCampaignDialog.test.tsx` — validates name, calls onCreate, closes on cancel
- [x] 11.5 Create `src/components/campaign/__tests__/CreateJourneyDialog.test.tsx` — validates name, calls onCreate with type, no campaign selector
- [x] 11.6 Create `src/components/campaign/__tests__/DeleteConfirmDialog.test.tsx` — shows item name, calls onConfirm/onCancel
- [x] 11.7 Create `src/contexts/__tests__/CampaignsContext.test.tsx` — CRUD operations, localStorage persistence, cascade delete, getJourneysForCampaign
