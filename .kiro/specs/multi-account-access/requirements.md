# Requirements Document

## Introduction

Multi-Account Access enables UbiQuity 2.0 prototype users to work across multiple root account hierarchies. Today, the prototype assumes a single root account (`acc-master`). This feature introduces two access patterns: standard users who are assigned to multiple root accounts via `user_account_assignments`, and platform admins (UbiQuity staff) who have system-level access to all root accounts. The existing nav bar AccountSwitcher continues to show child/grandchild accounts within the currently selected root — this feature adds root-level switching above it.

## Glossary

- **Root_Account**: An Account with `parentId: null`. The top of an account hierarchy tree. Three exist in the prototype: Serenity Spa Group, Christchurch City Council, Save the Children NZ.
- **Account_Tree**: A Root_Account and all its descendant accounts (children, grandchildren).
- **Account_Switcher**: The existing dropdown component in the nav bar (`AccountSwitcher.tsx`) that displays child and grandchild accounts within the currently selected Root_Account.
- **Root_Account_Selector**: A new UI control that allows switching between Root_Accounts. Appears in the avatar dropdown for Platform_Admins, or adapts the Account_Switcher for Multi_Account_Users.
- **Single_Account_User**: A user whose `user_account_assignments` reference accounts within exactly one Root_Account. Current default behaviour.
- **Multi_Account_User**: A user whose `user_account_assignments` reference accounts across two or more Root_Accounts. This is emergent — there is no explicit user type flag.
- **Platform_Admin**: A UbiQuity staff member with a system-level bypass flag granting access to all Root_Accounts and admin-only features. Managed via a pattern similar to `ADMIN_BYPASS_EMAILS` in FeatureFlagContext.
- **Active_Root_Account**: The Root_Account currently selected as the working context. Determines which Account_Tree the Account_Switcher displays.
- **All_Accounts_Mode**: A Platform_Admin-only view mode where no single Root_Account is selected, enabling cross-account features such as billing reports and activity logs.
- **User_Account_Assignment**: A record in `user_account_assignments` linking a user to an account with a permission group or custom permissions. Defined in `src/models/permissions.ts`.

## Requirements

### Requirement 1: Determine User Access Scope

**User Story:** As a user, I want the system to determine how many root accounts I can access based on my assignments, so that I see the appropriate account switching experience.

#### Acceptance Criteria

1. WHEN a user logs in, THE Account_Context SHALL resolve the set of Root_Accounts the user has access to by tracing each assigned account in User_Account_Assignments up to its Root_Account.
2. WHEN a user has assignments within exactly one Root_Account, THE Account_Context SHALL classify the user as a Single_Account_User.
3. WHEN a user has assignments across two or more Root_Accounts, THE Account_Context SHALL classify the user as a Multi_Account_User.
4. THE Account_Context SHALL expose the list of accessible Root_Accounts and the user's access classification to consuming components.

### Requirement 2: Single-Account User Experience (Unchanged)

**User Story:** As a single-account user, I want the account switcher to work exactly as it does today, so that my experience is unaffected by the multi-account feature.

#### Acceptance Criteria

1. WHILE the user is classified as a Single_Account_User, THE Account_Switcher SHALL display the Active_Root_Account and its descendant accounts in the existing dropdown format.
2. WHILE the user is classified as a Single_Account_User, THE Account_Switcher SHALL set the Active_Root_Account implicitly without displaying a root-level selector.
3. WHILE the user is classified as a Single_Account_User, THE Root_Account_Selector SHALL remain hidden.

### Requirement 3: Multi-Account User Root Switching

**User Story:** As a user assigned to multiple root accounts, I want to switch between my root accounts, so that I can manage each organisation's account tree independently.

#### Acceptance Criteria

1. WHILE the user is classified as a Multi_Account_User, THE Account_Switcher SHALL display all accessible Root_Accounts as selectable options, visually separated from child accounts.
2. WHEN a Multi_Account_User selects a Root_Account from the Account_Switcher, THE Account_Context SHALL set that Root_Account as the Active_Root_Account.
3. WHEN the Active_Root_Account changes, THE Account_Switcher SHALL update to display the selected Root_Account's Account_Tree (children and grandchildren).
4. THE Account_Switcher SHALL indicate which Root_Account is currently active using a visual distinction (e.g. active styling, checkmark).
5. WHEN a Multi_Account_User logs in, THE Account_Context SHALL default the Active_Root_Account to the first Root_Account in the user's assignment list.

### Requirement 4: Per-Root-Account Permissions

**User Story:** As a multi-account user, I want my permissions to reflect the role I hold in each root account, so that I see the correct capabilities when switching between organisations.

#### Acceptance Criteria

1. WHEN the Active_Root_Account changes, THE Permissions_Context SHALL resolve the user's effective permissions from the User_Account_Assignments for the Active_Root_Account's Account_Tree.
2. THE Permissions_Context SHALL support a user having different permission groups across different Root_Accounts (e.g. Admin on one, Viewer on another).
3. WHEN a user switches to a Root_Account where the user has no direct assignment to the root but has assignments to child accounts, THE Permissions_Context SHALL resolve permissions from those child account assignments.

### Requirement 5: Platform Admin Identification

**User Story:** As a platform admin, I want the system to recognise my admin status via a system-level flag, so that I receive elevated access without account-level assignment.

#### Acceptance Criteria

1. THE Platform_Admin_Context SHALL identify Platform_Admins using a configurable list of email addresses, following the pattern established by `ADMIN_BYPASS_EMAILS` in FeatureFlagContext.
2. THE Platform_Admin_Context SHALL expose a boolean `isPlatformAdmin` flag to consuming components.
3. THE Platform_Admin_Context SHALL grant Platform_Admins access to all Root_Accounts regardless of User_Account_Assignments.
4. IF the Platform_Admin email list is empty or misconfigured, THEN THE Platform_Admin_Context SHALL treat all users as non-admin.

### Requirement 6: Platform Admin Root Account Selector

**User Story:** As a platform admin, I want a root account selector in my avatar dropdown menu, so that I can jump between any root account or view cross-account data.

#### Acceptance Criteria

1. WHILE the user is a Platform_Admin, THE Avatar_Dropdown SHALL display a Root_Account_Selector section listing all Root_Accounts and an "All Accounts" option.
2. WHEN a Platform_Admin selects a Root_Account from the Root_Account_Selector, THE Account_Context SHALL set that Root_Account as the Active_Root_Account.
3. WHEN a Platform_Admin selects "All Accounts" from the Root_Account_Selector, THE Account_Context SHALL enter All_Accounts_Mode.
4. WHILE a Root_Account is selected, THE Account_Switcher SHALL display that Root_Account's Account_Tree in the nav bar.
5. THE Root_Account_Selector SHALL indicate the currently active selection (specific Root_Account or "All Accounts") using a visual distinction.
6. WHILE the user is not a Platform_Admin, THE Avatar_Dropdown SHALL hide the Root_Account_Selector section entirely.

### Requirement 7: All Accounts Mode (Platform Admin Only)

**User Story:** As a platform admin in All Accounts mode, I want to see cross-account views, so that I can access billing reports and activity logs spanning all organisations.

#### Acceptance Criteria

1. WHILE in All_Accounts_Mode, THE Account_Switcher SHALL display "All Accounts" as the selected context instead of a specific Root_Account name.
2. WHILE in All_Accounts_Mode, THE Account_Switcher SHALL disable or hide the child account dropdown since no single Account_Tree is selected.
3. WHILE in All_Accounts_Mode, THE Account_Context SHALL provide a flag indicating cross-account mode so that pages can render aggregate data.
4. WHEN a Platform_Admin navigates to a page that requires a specific Root_Account context (e.g. campaign management), THE System SHALL prompt the admin to select a Root_Account or gracefully indicate that a specific account must be chosen.

### Requirement 8: Platform Admin-Only Navigation Items

**User Story:** As a platform admin, I want to see admin-only features in the navigation, so that I can access billing reports, activity logs, and cross-organisation user management.

#### Acceptance Criteria

1. WHILE the user is a Platform_Admin, THE App_Nav_Bar SHALL display additional admin-only menu items: Billing Report, Activity Log, and User Management (cross-org).
2. WHILE the user is not a Platform_Admin, THE App_Nav_Bar SHALL hide admin-only menu items entirely.
3. WHEN a non-admin user navigates directly to an admin-only route, THE System SHALL redirect the user to the dashboard.

### Requirement 9: Mock Data for Multi-Account Scenarios

**User Story:** As a prototype reviewer, I want realistic mock data demonstrating multi-account scenarios, so that I can experience all access patterns during walkthroughs.

#### Acceptance Criteria

1. THE Seed_Data SHALL include at least one user assigned to accounts across two or more Root_Accounts with different permission groups per root.
2. THE Seed_Data SHALL include at least one user configured as a Platform_Admin via the admin email list.
3. THE Seed_Data SHALL preserve all existing single-account user assignments unchanged.
4. THE Seed_Data SHALL include the three existing Root_Accounts: Serenity Spa Group, Christchurch City Council, and Save the Children NZ.

### Requirement 10: Account Context State Persistence

**User Story:** As a user, I want my selected root account to persist during my session, so that navigating between pages does not reset my account context.

#### Acceptance Criteria

1. WHEN a user selects a Root_Account, THE Account_Context SHALL retain the Active_Root_Account selection across page navigations within the same session.
2. WHEN a user refreshes the browser, THE Account_Context SHALL restore the previously selected Active_Root_Account from session or local storage.
3. IF the stored Active_Root_Account is no longer accessible to the user, THEN THE Account_Context SHALL fall back to the user's first accessible Root_Account.
