# Requirements Document

## Introduction

Add an asset management system to the UbiQuity 2.0 prototype that allows marketers to browse, upload (simulated), and organise digital assets (images, colours, fonts, footers, etc.) across three scope levels: Global (workspace-wide), Campaign-level, and Account-level. The asset library lives under Content > Assets in the navigation. Assets at higher scopes are visible to lower scopes (global assets are available everywhere, account assets are available within that account's campaigns). This is a frontend-only feature using React context and localStorage for persistence, reusing the existing account hierarchy from `src/data/accounts.ts` and campaign data from `CampaignsContext`.

## Glossary

- **Assets_Page**: The page at `/content/assets` that displays the asset library with scope-level browsing and management controls
- **Asset_Card**: A card component representing a single asset, displaying a thumbnail or icon, name, type badge, and scope indicator
- **Asset_Scope**: The visibility level of an asset — one of Global, Campaign, or Account
- **Global_Scope**: Assets available across the entire workspace, not tied to any specific account or campaign
- **Campaign_Scope**: Assets tied to a specific campaign, available only within that campaign's context
- **Account_Scope**: Assets tied to a specific account in the hierarchy, available within that account and its campaigns
- **Scope_Selector**: A tabbed or segmented control that switches the asset view between Global, Campaign, and Account scope levels
- **Asset_Type**: The category of an asset — one of image, colour, font, or footer
- **Upload_Dialog**: A modal dialog for simulating asset upload, capturing asset metadata (name, type, scope assignment)
- **Asset_Detail_Panel**: A side panel or expanded view showing full asset metadata, preview, and actions
- **Assets_Context**: The React context provider managing asset state with localStorage persistence
- **Type_Filter**: A filter control for narrowing displayed assets by their Asset_Type

## Requirements

### Requirement 1: Asset Library Page Under Content Navigation

**User Story:** As a marketer, I want to access an asset library from the Content section of the navigation, so that I can find and manage all my digital assets in one place.

#### Acceptance Criteria

1. THE Assets_Page SHALL be accessible at the route `/content/assets`
2. THE AppNavBar SHALL include an "Assets" sub-item under the "Content" primary navigation item
3. WHEN a user navigates to `/content/assets`, THE Assets_Page SHALL display the asset library with a page heading of "Assets"
4. THE Assets_Page SHALL display a Scope_Selector control allowing the user to switch between Global, Campaign, and Account scope views

### Requirement 2: Scope-Based Asset Browsing

**User Story:** As a marketer, I want to browse assets by scope level, so that I can find assets relevant to my current working context (global, campaign, or account).

#### Acceptance Criteria

1. WHEN the Global scope tab is selected, THE Assets_Page SHALL display all assets with Asset_Scope set to Global
2. WHEN the Campaign scope tab is selected, THE Assets_Page SHALL display a campaign picker dropdown and show assets belonging to the selected campaign
3. WHEN the Account scope tab is selected, THE Assets_Page SHALL display assets belonging to the currently selected account from the AccountContext
4. THE Assets_Page SHALL display assets as Asset_Card components arranged in a responsive grid
5. WHILE no assets exist for the selected scope and filter combination, THE Assets_Page SHALL display an empty state message with a prompt to upload the first asset

### Requirement 3: Asset Card Display

**User Story:** As a marketer, I want to see asset details at a glance on each card, so that I can quickly identify assets by their thumbnail, name, and type.

#### Acceptance Criteria

1. THE Asset_Card SHALL display the asset name, a type badge indicating the Asset_Type, and a scope indicator label
2. WHEN the asset type is "image", THE Asset_Card SHALL display a placeholder thumbnail preview
3. WHEN the asset type is "colour", THE Asset_Card SHALL display a colour swatch preview
4. WHEN the asset type is "font", THE Asset_Card SHALL display a font name preview with a sample text rendering
5. WHEN the asset type is "footer", THE Asset_Card SHALL display a document-style icon preview
6. THE Asset_Card SHALL display the asset creation date in a human-readable format

### Requirement 4: Asset Type Filtering

**User Story:** As a marketer, I want to filter assets by type within a scope, so that I can narrow down the library to find specific asset categories.

#### Acceptance Criteria

1. THE Assets_Page SHALL display a Type_Filter control with selectable chips for each Asset_Type (image, colour, font, footer)
2. WHEN a user selects a type chip, THE Assets_Page SHALL filter the asset grid to show only assets matching the selected type
3. WHEN a user deselects all type chips, THE Assets_Page SHALL display all assets for the current scope without type filtering
4. WHEN a user selects multiple type chips, THE Assets_Page SHALL display assets matching any of the selected types

### Requirement 5: Simulated Asset Upload

**User Story:** As a marketer, I want to upload new assets to the library, so that I can add images, colours, fonts, and footers for use across my campaigns.

#### Acceptance Criteria

1. THE Assets_Page SHALL display an "Upload Asset" button in the page header area
2. WHEN a user clicks the "Upload Asset" button, THE Assets_Page SHALL open the Upload_Dialog as a modal overlay
3. THE Upload_Dialog SHALL require an asset name input and an Asset_Type selection
4. THE Upload_Dialog SHALL require a scope assignment — Global, a specific campaign, or the current account
5. WHEN the scope is set to Campaign, THE Upload_Dialog SHALL display a campaign picker dropdown populated from the CampaignsContext
6. WHEN a user submits the Upload_Dialog with valid inputs, THE Assets_Context SHALL add the new asset to local state and THE Assets_Page SHALL display the new Asset_Card in the grid
7. IF the user submits the Upload_Dialog with an empty name, THEN THE Upload_Dialog SHALL prevent submission and indicate that a name is required
8. WHEN the asset type is "colour", THE Upload_Dialog SHALL display a hex colour input field for specifying the colour value

### Requirement 6: Asset Detail View

**User Story:** As a marketer, I want to view full details of an asset, so that I can see its metadata, preview, and scope assignment.

#### Acceptance Criteria

1. WHEN a user clicks an Asset_Card, THE Assets_Page SHALL open the Asset_Detail_Panel displaying the full asset metadata
2. THE Asset_Detail_Panel SHALL display the asset name, type, scope, creation date, and a larger preview
3. THE Asset_Detail_Panel SHALL display a "Delete" button for removing the asset
4. THE Asset_Detail_Panel SHALL display a "Close" button or allow closing by clicking outside the panel

### Requirement 7: Asset Deletion

**User Story:** As a marketer, I want to delete assets I no longer need, so that I can keep the asset library clean and relevant.

#### Acceptance Criteria

1. WHEN a user clicks the "Delete" button on the Asset_Detail_Panel, THE Asset_Detail_Panel SHALL display a confirmation dialog before removing the asset
2. WHEN the user confirms deletion, THE Assets_Context SHALL remove the asset from local state and THE Assets_Page SHALL remove the Asset_Card from the grid
3. WHEN the user cancels deletion, THE Asset_Detail_Panel SHALL remain open with no changes

### Requirement 8: Asset State Persistence

**User Story:** As a marketer, I want my asset library to persist across browser sessions, so that I do not lose uploaded assets when I close and reopen the prototype.

#### Acceptance Criteria

1. THE Assets_Context SHALL persist all asset data to localStorage under a dedicated storage key
2. WHEN the Assets_Page loads, THE Assets_Context SHALL restore asset data from localStorage
3. IF localStorage data is missing or corrupted, THEN THE Assets_Context SHALL fall back to seed data containing sample assets across all three scope levels
4. WHEN an asset is added or deleted, THE Assets_Context SHALL update localStorage within the same operation

### Requirement 9: Account-Scoped Asset Filtering

**User Story:** As a marketer working within a specific account context, I want the asset library to respect the current account selection, so that I see account-level assets relevant to my selected account.

#### Acceptance Criteria

1. WHEN the Account scope tab is selected, THE Assets_Page SHALL display only assets whose accountId matches the currently selected account from the AccountContext
2. WHEN the account context changes while viewing Account-scoped assets, THE Assets_Page SHALL re-render the asset grid to reflect the updated account filter
3. WHEN the master account is selected and the Account scope tab is active, THE Assets_Page SHALL display all account-level assets across all accounts

### Requirement 10: Search Assets by Name

**User Story:** As a marketer, I want to search for assets by name, so that I can quickly find a specific asset without scrolling through the entire library.

#### Acceptance Criteria

1. THE Assets_Page SHALL display a search input field above the asset grid
2. WHEN a user types in the search input, THE Assets_Page SHALL filter the displayed assets to those whose name contains the search text (case-insensitive)
3. WHEN the search input is cleared, THE Assets_Page SHALL display all assets for the current scope and type filter combination
4. THE search filter SHALL apply in combination with the active scope tab and type filter selections
