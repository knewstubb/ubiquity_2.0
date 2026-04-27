# Requirements Document

## Introduction

Redesign the Campaigns and Journeys pages in the UbiQuity 2.0 prototype from flat data tables into a folder-based navigation UI. Campaigns become folder cards displayed in a grid on the Campaigns page (similar to Dropbox/Google Drive folder views). Clicking a campaign folder navigates into it, revealing the journeys inside as cards. Journeys use tags for grouping and filtering within a campaign. This is a frontend-only redesign — local state, no backend, using existing seed data from the NZ spa chain dataset.

## Glossary

- **Campaigns_Page**: The page at `/automations/campaigns` that displays all campaigns as folder cards in a grid layout
- **Campaign_Folder_Card**: A card component representing a single campaign, displaying the campaign name, journey count, status, and an overflow menu
- **Campaign_Detail_View**: The view displayed when a user opens a campaign folder, showing the campaign name as a heading and its journeys as cards below
- **Journey_Card**: A card component representing a single journey within a campaign, displaying the journey name, type, status, entry count, and action controls
- **Tag_Filter**: A UI control that allows filtering journeys within a campaign by their type tags
- **Create_Campaign_Dialog**: A modal dialog for creating a new campaign with a name and optional goal
- **Create_Journey_Dialog**: A modal dialog for creating a new journey within a specific campaign, capturing name and type
- **Overflow_Menu**: A contextual menu triggered by a three-dot icon on a card, offering actions such as rename and delete
- **Breadcrumb_Bar**: A navigation element showing the path from the campaigns list to the current campaign folder, enabling back-navigation
- **Journey_Builder_Canvas**: The existing journey editing page at `/automations/journeys/:journeyId`

## Requirements

### Requirement 1: Campaign Folder Grid Display

**User Story:** As a marketer, I want to see my campaigns displayed as folder cards in a grid, so that I can visually browse and manage campaigns like files in a folder manager.

#### Acceptance Criteria

1. WHEN the Campaigns_Page loads, THE Campaigns_Page SHALL display all campaigns as Campaign_Folder_Card components arranged in a responsive grid
2. THE Campaign_Folder_Card SHALL display the campaign name, the count of journeys belonging to that campaign, and the campaign status
3. THE Campaign_Folder_Card SHALL use a folder icon from Phosphor Icons to visually distinguish campaigns as containers
4. WHEN the browser viewport width decreases, THE Campaigns_Page SHALL reflow the Campaign_Folder_Card grid to fewer columns while maintaining card readability
5. WHILE no campaigns exist for the current account filter, THE Campaigns_Page SHALL display an empty state message indicating no campaigns are available

### Requirement 2: Campaign Folder Navigation

**User Story:** As a marketer, I want to click a campaign folder to see the journeys inside it, so that I can drill into a specific campaign and manage its journeys.

#### Acceptance Criteria

1. WHEN a user clicks a Campaign_Folder_Card, THE Campaigns_Page SHALL navigate to the Campaign_Detail_View for that campaign
2. THE Campaign_Detail_View SHALL display the campaign name as a page heading and list all journeys belonging to that campaign as Journey_Card components in a grid
3. THE Campaign_Detail_View SHALL display a Breadcrumb_Bar showing "Campaigns > {campaign name}" to indicate the navigation path
4. WHEN a user clicks the "Campaigns" link in the Breadcrumb_Bar, THE Campaign_Detail_View SHALL navigate back to the Campaigns_Page
5. WHILE no journeys exist within the selected campaign, THE Campaign_Detail_View SHALL display an empty state message with a prompt to create the first journey

### Requirement 3: Journey Card Display

**User Story:** As a marketer, I want to see journey details at a glance on each card, so that I can quickly assess journey status and type without opening each one.

#### Acceptance Criteria

1. THE Journey_Card SHALL display the journey name, journey type, status badge, and entry count
2. THE Journey_Card SHALL display a type-specific icon from Phosphor Icons to visually differentiate journey types (welcome, re-engagement, transactional, promotional)
3. WHEN a user clicks a Journey_Card, THE Campaign_Detail_View SHALL navigate to the Journey_Builder_Canvas at `/automations/journeys/:journeyId`
4. THE Journey_Card SHALL display an Overflow_Menu trigger (three-dot icon) for contextual actions

### Requirement 4: Tag-Based Journey Filtering

**User Story:** As a marketer, I want to filter journeys within a campaign by type tags, so that I can focus on specific journey categories when a campaign contains many journeys.

#### Acceptance Criteria

1. THE Campaign_Detail_View SHALL display a row of selectable tag chips above the journey grid, derived from the distinct journey types present in the current campaign
2. WHEN a user selects a tag chip, THE Campaign_Detail_View SHALL filter the journey grid to show only journeys matching the selected type
3. WHEN a user deselects all tag chips, THE Campaign_Detail_View SHALL display all journeys in the campaign without filtering
4. WHEN a user selects multiple tag chips, THE Campaign_Detail_View SHALL display journeys matching any of the selected types

### Requirement 5: Create New Campaign

**User Story:** As a marketer, I want to create a new campaign folder from the Campaigns page, so that I can organise new sets of journeys under a named container.

#### Acceptance Criteria

1. THE Campaigns_Page SHALL display a "New Campaign" button in the page header area
2. WHEN a user clicks the "New Campaign" button, THE Campaigns_Page SHALL open the Create_Campaign_Dialog as a modal overlay
3. THE Create_Campaign_Dialog SHALL require a campaign name input and provide an optional goal text field
4. WHEN a user submits the Create_Campaign_Dialog with a valid name, THE Campaigns_Page SHALL add a new campaign to the local state with status "draft" and display the new Campaign_Folder_Card in the grid
5. IF the user submits the Create_Campaign_Dialog with an empty name, THEN THE Create_Campaign_Dialog SHALL prevent submission and indicate that a name is required

### Requirement 6: Create New Journey Within Campaign

**User Story:** As a marketer, I want to create a new journey from within a campaign folder, so that the journey is automatically associated with the correct campaign.

#### Acceptance Criteria

1. THE Campaign_Detail_View SHALL display a "Create Journey" button in the page header area
2. WHEN a user clicks the "Create Journey" button, THE Campaign_Detail_View SHALL open the Create_Journey_Dialog as a modal overlay
3. THE Create_Journey_Dialog SHALL require a journey name and a journey type selection (welcome, re-engagement, transactional, promotional)
4. THE Create_Journey_Dialog SHALL pre-associate the new journey with the current campaign without requiring the user to select a campaign
5. WHEN a user submits the Create_Journey_Dialog with valid inputs, THE Campaign_Detail_View SHALL add the new journey to local state and navigate to the Journey_Builder_Canvas for the new journey

### Requirement 7: Campaign Folder Overflow Actions

**User Story:** As a marketer, I want to rename or delete a campaign from its folder card, so that I can manage campaign metadata without navigating away from the grid view.

#### Acceptance Criteria

1. WHEN a user clicks the Overflow_Menu trigger on a Campaign_Folder_Card, THE Campaign_Folder_Card SHALL display a dropdown menu with "Rename" and "Delete" options
2. WHEN a user selects "Rename" from the Overflow_Menu, THE Campaign_Folder_Card SHALL display an inline text input pre-filled with the current campaign name
3. WHEN a user confirms the rename, THE Campaign_Folder_Card SHALL update the campaign name in local state and reflect the change on the card
4. WHEN a user selects "Delete" from the Overflow_Menu, THE Campaign_Folder_Card SHALL display a confirmation dialog before removing the campaign from local state
5. WHEN the Overflow_Menu is open and the user clicks outside of the menu, THE Overflow_Menu SHALL close without performing any action

### Requirement 8: Journey Card Overflow Actions

**User Story:** As a marketer, I want to rename or delete a journey from its card, so that I can manage journeys without opening the builder canvas.

#### Acceptance Criteria

1. WHEN a user clicks the Overflow_Menu trigger on a Journey_Card, THE Journey_Card SHALL display a dropdown menu with "Rename" and "Delete" options
2. WHEN a user selects "Rename" from the Overflow_Menu, THE Journey_Card SHALL display an inline text input pre-filled with the current journey name
3. WHEN a user confirms the rename, THE Journey_Card SHALL update the journey name in local state and reflect the change on the card
4. WHEN a user selects "Delete" from the Overflow_Menu, THE Journey_Card SHALL display a confirmation dialog before removing the journey from local state
5. IF a campaign has no remaining journeys after a deletion, THEN THE Campaign_Detail_View SHALL display the empty state message

### Requirement 9: Journeys Page Redirect

**User Story:** As a marketer, I want the standalone Journeys page to list all journeys across campaigns with a link to their parent campaign, so that I can find a journey without knowing which campaign it belongs to.

#### Acceptance Criteria

1. WHEN the Journeys page at `/automations/journeys` loads, THE Journeys page SHALL display all journeys across all campaigns as Journey_Card components in a grid
2. THE Journey_Card on the Journeys page SHALL display the parent campaign name as a subtitle or secondary label on each card
3. WHEN a user clicks a Journey_Card on the Journeys page, THE Journeys page SHALL navigate to the Journey_Builder_Canvas at `/automations/journeys/:journeyId`
4. THE Journeys page SHALL support the same Tag_Filter controls as the Campaign_Detail_View for filtering by journey type

### Requirement 10: Account-Scoped Data Filtering

**User Story:** As a marketer working within a specific account context, I want the folder view to respect the current account filter, so that I only see campaigns and journeys relevant to my selected account.

#### Acceptance Criteria

1. THE Campaigns_Page SHALL filter displayed Campaign_Folder_Card components based on the active account context from the AccountContext provider
2. THE Campaign_Detail_View SHALL filter displayed Journey_Card components based on the active account context
3. WHEN the account context changes, THE Campaigns_Page SHALL re-render the campaign grid to reflect the updated filter
4. WHEN the account context changes while viewing a Campaign_Detail_View, THE Campaign_Detail_View SHALL re-render the journey grid to reflect the updated filter
