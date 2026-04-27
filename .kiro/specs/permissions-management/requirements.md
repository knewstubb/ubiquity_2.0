# Requirements Document

## Introduction

Add a permissions management system to the UbiQuity 2.0 prototype under Settings. The feature enables administrators to manage user access across the existing multi-level account hierarchy (Master → Region). The page lives at `/settings/permissions` and is organised into three equal top-level tabs: Permission Groups, User Permissions, and Account Permissions.

The Permission Groups tab provides a master-detail layout for creating and editing reusable permission templates. Each Permission Group defines a named combination of CRUD toggles across functional areas that map to the application's navigation sections (Dashboard, Audiences, Campaigns, Content, Analytics, Settings). The User Permissions tab lets administrators select a user and assign them to accounts via an interactive account tree with checkboxes, choosing a Permission Group per account. The Account Permissions tab lets administrators select an account from the hierarchy tree and see all users who have access, with the ability to manage their assignments.

This is a frontend-only prototype using local state — no backend, consistent with the rest of the UbiQuity prototype. The existing account data from `src/data/accounts.ts` and user data from the Settings page are reused directly. Users are extracted to a shared data file (`src/data/users.ts`) so both SettingsPage and PermissionsPage can import them.

## Glossary

- **Permissions_Page**: The page at `/settings/permissions` that serves as the entry point for managing permissions, containing three tabs
- **Tab_Bar**: The horizontal tab navigation at the top of the Permissions_Page with three tabs: Permission Groups, User Permissions, and Account Permissions
- **Permission_Groups_Tab**: The first tab on the Permissions_Page where administrators create, edit, and delete Permission Groups using a master-detail layout
- **User_Permissions_Tab**: The second tab on the Permissions_Page where administrators select a user and manage their account access and permission assignments via the Account_Tree
- **Account_Permissions_Tab**: The third tab on the Permissions_Page where administrators select an account and manage all users who have access to it
- **Account_Tree**: The nested hierarchy of existing accounts displayed as an interactive tree structure with visual hierarchy icons and connecting lines, dynamically built from the `accounts` array using `parentId`/`childIds`
- **Permission**: A single CRUD capability (Create, Read, Update, Delete) within a Functional_Group
- **Functional_Group**: A named category that maps to a navigation section in the app (Dashboard, Audiences, Campaigns, Content, Analytics, Settings), grouping related CRUD permissions together
- **Permission_Group**: A saved, named combination of CRUD toggle states across all Functional_Groups, displayed as a card grid in the Permission_Groups_Tab
- **Permission_Card**: A card UI element within the Permission_Groups_Tab that represents a single Functional_Group, showing its name as a heading and four CRUD toggle switches
- **Toggle_Switch**: A teal (on) / grey (off) toggle switch used for individual CRUD permissions within a Permission_Card
- **Cascading_Access**: The behaviour where granting a user access to a parent account automatically grants access to all child accounts in that branch
- **Indeterminate_Checkbox**: A checkbox state (dash icon) shown on a parent account when some but not all of its children are checked
- **Custom_Permissions**: A state where a user's permissions on a specific account differ from any named Permission_Group, displayed as "Custom" instead of a group name
- **Administrator**: A user with the Admin Permission_Group who can manage other users' permissions and account access
- **Hierarchy_Icons**: Phosphor Icons used to indicate account position in the tree — Buildings for root accounts (`parentId === null`), GlobeHemisphereWest for accounts with children (`childIds.length > 0` and `parentId !== null`), MapPin for leaf accounts (`childIds.length === 0`)

## Requirements

### Requirement 1: Permissions Page Navigation and Tab Bar

**User Story:** As an administrator, I want to access permissions management from the Settings area with three clearly labelled tabs, so that I can switch between managing permission groups, user permissions, and account permissions.

#### Acceptance Criteria

1. THE Permissions_Page SHALL be accessible at the route `/settings/permissions`
2. WHEN an administrator navigates to `/settings`, THE Settings page SHALL display a navigation link to the Permissions_Page
3. THE Permissions_Page SHALL display a Tab_Bar at the top with three tabs labelled "Permission Groups", "User Permissions", and "Account Permissions"
4. WHEN the Permissions_Page loads, THE Tab_Bar SHALL default to the Permission_Groups_Tab as the active tab
5. WHEN an administrator clicks a tab in the Tab_Bar, THE Permissions_Page SHALL switch to display the corresponding tab content
6. THE Tab_Bar SHALL visually highlight the active tab using the existing UbiQuity tab styling patterns

### Requirement 2: Permission Groups Tab — Master-Detail Layout

**User Story:** As an administrator, I want to browse and manage Permission Groups in a master-detail layout, so that I can see the list of groups alongside the selected group's details.

#### Acceptance Criteria

1. THE Permission_Groups_Tab SHALL display a left sidebar listing all Permission_Groups, each showing its name and description
2. THE Permission_Groups_Tab sidebar SHALL display a "+ Create" button at the top of the group list
3. WHEN an administrator selects a Permission_Group from the sidebar list, THE Permission_Groups_Tab SHALL display the selected group's name and description as a heading in the main content area
4. THE Permission_Groups_Tab main content area SHALL display "Edit" (outlined style) and "Delete" (red style) action buttons below the group heading
5. THE Permission_Groups_Tab main content area SHALL display Permission_Cards arranged in a responsive grid below the action buttons
6. THE Permission_Groups_Tab sidebar SHALL visually highlight the currently selected Permission_Group
7. WHILE no Permission_Group is selected, THE Permission_Groups_Tab main area SHALL display a prompt instructing the administrator to select or create a group

### Requirement 3: Permission Cards with CRUD Toggles

**User Story:** As an administrator, I want to see each navigation section as a card with CRUD toggle switches, so that I can understand and configure permissions at a glance.

#### Acceptance Criteria

1. WHEN a Permission_Group is selected, THE Permission_Groups_Tab SHALL display one Permission_Card per Functional_Group (Dashboard, Audiences, Campaigns, Content, Analytics, Settings)
2. THE Permission_Card SHALL display the Functional_Group name as a card heading
3. THE Permission_Card SHALL display four Toggle_Switches labelled "Create", "Read", "Update", and "Delete"
4. THE Toggle_Switch SHALL display in teal when enabled and grey when disabled
5. WHILE viewing a Permission_Group (not editing), THE Toggle_Switches on each Permission_Card SHALL be in a read-only state reflecting the group's saved permissions
6. THE CRUD toggles SHALL support future granular use, but for the demo the default Permission_Groups SHALL typically have all four toggles on or all four off per Functional_Group to simulate simple access on/off behaviour

### Requirement 4: Permission Group CRUD Operations

**User Story:** As an administrator, I want to create, edit, and delete Permission Groups, so that I can define reusable permission templates that match my organisation's roles.

#### Acceptance Criteria

1. WHEN an administrator clicks "+ Create" in the sidebar, THE Permission_Groups_Tab SHALL display an inline form with a name field, a description field, and the full set of Permission_Cards with all toggles off
2. WHEN an administrator submits a new Permission_Group with a valid name and at least one permission enabled, THE Permission_Groups_Tab SHALL add the group to local state and display it in the sidebar list
3. IF an administrator submits a Permission_Group with an empty name, THEN THE Permission_Groups_Tab SHALL prevent submission and indicate that a name is required
4. WHEN an administrator clicks "Edit" on a selected Permission_Group, THE Permission_Groups_Tab SHALL make the name, description, and all Toggle_Switches editable
5. WHEN an administrator saves edits to a Permission_Group, THE Permissions_Page SHALL update the effective permissions for all users currently assigned to that group across all accounts
6. WHEN an administrator clicks "Delete" on a selected Permission_Group, THE Permission_Groups_Tab SHALL display a confirmation dialog warning that users assigned to this group will have their assignment changed to "Custom" with their current permissions preserved
7. WHEN the administrator confirms deletion, THE Permission_Groups_Tab SHALL remove the group from local state and update all affected user assignments to "Custom"

### Requirement 5: User Permissions Tab — User Selection Sidebar

**User Story:** As an administrator, I want to select a user from a sidebar list to manage their permissions, so that I can configure access for a specific person.

#### Acceptance Criteria

1. THE User_Permissions_Tab SHALL display a left sidebar with a "Users" heading and a list of all users imported from the shared users data file
2. THE User_Permissions_Tab sidebar SHALL display each user with an avatar circle (initials), their name, and their email address
3. WHEN an administrator selects a user from the sidebar list, THE User_Permissions_Tab SHALL highlight the selected user with a light background colour
4. WHEN a user is selected, THE User_Permissions_Tab main area SHALL display a heading "Permissions for {User Name}" with a subtitle "Select accounts to grant access."
5. WHILE no user is selected, THE User_Permissions_Tab main area SHALL display a prompt instructing the administrator to select a user

### Requirement 6: Account Tree with Hierarchy Icons and Cascading Access

**User Story:** As an administrator, I want to see the full account hierarchy as an interactive tree with checkboxes and hierarchy icons, so that I can grant or revoke access to multiple accounts at once.

#### Acceptance Criteria

1. WHEN a user is selected in the User_Permissions_Tab, THE main area SHALL display the Account_Tree showing all accounts from the existing `accounts` data in their parent-child hierarchy with a checkbox next to each account
2. THE Account_Tree SHALL display Hierarchy_Icons next to each account derived from the account's position in the tree: Buildings icon for root accounts (`parentId === null`), GlobeHemisphereWest icon for intermediate accounts (has `parentId` and non-empty `childIds`), and MapPin icon for leaf accounts (empty `childIds`)
3. THE Account_Tree SHALL render visual connecting lines between parent and child nodes to indicate the hierarchy structure
4. THE Account_Tree SHALL render parent accounts as expandable nodes with their child accounts nested beneath them
5. WHEN an administrator checks a parent account checkbox, THE Account_Tree SHALL automatically check all child account checkboxes in that branch (Cascading_Access)
6. WHEN an administrator unchecks a parent account checkbox, THE Account_Tree SHALL automatically uncheck all child account checkboxes in that branch
7. WHEN some but not all child accounts under a parent are checked, THE Account_Tree SHALL display the parent checkbox in an Indeterminate_Checkbox state (dash icon)
8. WHEN an account checkbox is checked, THE Account_Tree SHALL display a Permission_Group dropdown and a pencil/edit icon inline next to that account
9. WHEN Cascading_Access checks child accounts automatically, THE Account_Tree SHALL assign the same Permission_Group selected on the parent account to each child account
10. THE Account_Tree SHALL dynamically build the hierarchy from the existing accounts data using `parentId` and `childIds`, working with any account hierarchy structure

### Requirement 7: Permission Group Assignment in User Permissions Tab

**User Story:** As an administrator, I want to assign a Permission Group to a user for a specific account via a dropdown, so that I can grant a predefined set of permissions without configuring each one individually.

#### Acceptance Criteria

1. THE Permission_Group dropdown displayed next to a checked account SHALL list all available Permission_Groups plus a "Custom" option
2. WHEN an administrator selects a Permission_Group from the dropdown, THE User_Permissions_Tab SHALL assign all permissions defined in that group to the user for that account
3. WHEN an administrator changes the Permission_Group on a parent account, THE Account_Tree SHALL update all cascaded child accounts to the new Permission_Group
4. WHEN an administrator clicks the pencil/edit icon next to a checked account, THE User_Permissions_Tab SHALL open an inline or modal view showing the Permission_Cards with editable Toggle_Switches for that account
5. WHEN the toggled permissions exactly match an existing Permission_Group definition, THE dropdown SHALL display that Permission_Group name
6. WHEN the toggled permissions do not match any Permission_Group definition, THE dropdown SHALL display "Custom" as the selected value
7. THE User_Permissions_Tab SHALL display a "Save Changes" button (teal, with a floppy disk icon) in the top-right of the main content area
8. WHEN an administrator clicks "Save Changes", THE User_Permissions_Tab SHALL persist all permission changes to local state

### Requirement 8: Account Permissions Tab — Account Selection Sidebar

**User Story:** As an administrator, I want to select an account from a hierarchy tree in a sidebar, so that I can see and manage all users who have access to that account.

#### Acceptance Criteria

1. THE Account_Permissions_Tab SHALL display a left sidebar with an "Accounts" heading and the full Account_Tree rendered as a selectable tree (without checkboxes), built dynamically from the existing accounts data
2. THE Account_Permissions_Tab sidebar tree SHALL display Hierarchy_Icons next to each account matching the same icon scheme as the User_Permissions_Tab
3. WHEN an administrator selects an account from the sidebar tree, THE Account_Permissions_Tab SHALL highlight the selected account
4. WHEN an account is selected, THE Account_Permissions_Tab main area SHALL display a heading "Users with Access to {Account Name}" with a subtitle "{N} user(s) have access."
5. WHILE no account is selected, THE Account_Permissions_Tab main area SHALL display a prompt instructing the administrator to select an account

### Requirement 9: Account Permissions Tab — User Access Management

**User Story:** As an administrator, I want to view and manage all users who have access to a specific account, so that I can audit and adjust access from an account-centric perspective.

#### Acceptance Criteria

1. WHEN an account is selected, THE Account_Permissions_Tab main area SHALL display user cards stacked vertically, one per user with access
2. THE user card SHALL display the user's avatar circle, name, email, a Permission_Group dropdown, and a pencil/edit icon
3. WHEN an administrator changes a Permission_Group dropdown on a user card, THE Account_Permissions_Tab SHALL update that user's permissions for the selected account in local state
4. WHEN an administrator clicks the pencil/edit icon on a user card, THE Account_Permissions_Tab SHALL open an inline or modal view showing the Permission_Cards with editable Toggle_Switches for that user on the selected account
5. THE Account_Permissions_Tab SHALL display a "+ Manage Users" button (teal) in the top-right of the main content area
6. WHEN an administrator clicks "+ Manage Users", THE Account_Permissions_Tab SHALL open a dialog to add or remove users' access to the selected account with a chosen Permission_Group

### Requirement 10: Default Permission Groups and Functional Groups

**User Story:** As an administrator, I want the system to include sensible default Permission Groups mapped to the app's navigation sections, so that I can start assigning permissions immediately and see the effect in the prototype.

#### Acceptance Criteria

1. THE Permissions_Page SHALL include the following default Permission_Groups in the initial seed data: "Admin" (all CRUD permissions enabled across all Functional_Groups), "Editor" (Dashboard, Audiences, Campaigns, Content — all CRUD enabled; Analytics and Settings — disabled), and "Viewer" (Dashboard — all CRUD enabled, Audiences — Read only, Analytics — Read only; Campaigns, Content, and Settings — disabled)
2. THE seed data SHALL define the following Functional_Groups matching the app's navigation sections: Dashboard, Audiences, Campaigns, Content, Analytics, and Settings
3. WHEN the prototype loads for the first time, THE Permissions_Page SHALL have the default Permission_Groups available without requiring administrator setup
4. THE data model SHALL retain full CRUD granularity (Create, Read, Update, Delete) per Functional_Group to support future refinement, even though the demo defaults use all-on or all-off per section

### Requirement 11: Shared User and Account Data

**User Story:** As a prototype developer, I want user data extracted to a shared file and the existing account hierarchy used directly, so that both SettingsPage and PermissionsPage reference the same data without duplication.

#### Acceptance Criteria

1. THE user data (Aroha Mitchell, Nikau Patel, Maia Chen, Tāne Williams, Isla Thompson) SHALL be extracted from SettingsPage.tsx into a shared data file at `src/data/users.ts`
2. THE SettingsPage SHALL import users from the shared data file instead of defining them inline
3. THE permissions feature SHALL use the existing `Account` interface and `accounts` array from `src/data/accounts.ts` directly — no separate hierarchy account type or additional account data
4. THE Account_Tree SHALL dynamically derive hierarchy icons from each account's position in the tree (`parentId === null` → root, non-empty `childIds` with `parentId` → intermediate, empty `childIds` → leaf) rather than relying on a `level` field
5. THE account tree rendering SHALL work with any account hierarchy structure, not hardcoded to a specific set of accounts

### Requirement 12: User Seed Data with Permission Assignments

**User Story:** As a prototype user, I want pre-configured users with varying permission assignments, so that the permissions UI demonstrates realistic scenarios on first load.

#### Acceptance Criteria

1. THE seed data SHALL assign Aroha Mitchell as Admin on "Serenity Spa Group" (acc-master), cascading to all child accounts
2. THE seed data SHALL assign Nikau Patel as Editor on "Serenity Spa Group" (acc-master), cascading to all child accounts
3. THE seed data SHALL assign Maia Chen as Editor on "Serenity Spa Auckland" (acc-auckland) and "Serenity Spa Wellington" (acc-wellington) only
4. THE seed data SHALL assign Tāne Williams as Viewer on "Serenity Spa Group" (acc-master), cascading to all child accounts
5. THE seed data SHALL assign Isla Thompson with Custom permissions on "Serenity Spa Queenstown" (acc-queenstown) only, with Dashboard and Audiences access enabled and Campaigns, Content, Analytics, and Settings disabled
6. THE seed data SHALL demonstrate cascading access (Aroha, Nikau, Tāne), partial account access (Maia), single-account access (Isla), and custom permissions (Isla)
