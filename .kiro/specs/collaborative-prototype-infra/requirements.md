# Requirements Document

## Introduction

Transform the UbiQuity 2.0 interactive design prototype from a local-only tool into a collaborative, hosted prototype that colleagues can access, explore, and provide feedback on. The prototype currently runs entirely on local state with mock data in `src/data/`. This feature introduces Supabase as the persistent backend, adds authentication, and layers on collaboration tooling (feedback annotations, activity tracking, role simulation) so the prototype becomes a shared review environment rather than a solo design artefact.

## Glossary

- **Prototype**: The UbiQuity 2.0 React application — an interactive design prototype, not production software
- **Supabase_Client**: The Supabase JavaScript client library (`@supabase/supabase-js`) used for authentication, database queries, and real-time subscriptions
- **Auth_Service**: The Supabase Auth module responsible for user sign-up, login, session management, and token refresh
- **Data_Layer**: The abstraction that replaces direct imports from `src/data/` with Supabase queries, providing the same data shapes to existing React contexts
- **Feature_Flag_Service**: A lightweight key-value store (Supabase table) that controls which prototype pages and capabilities are visible to reviewers
- **Feedback_Service**: The subsystem that stores and retrieves contextual comments (annotations) tied to specific pages
- **Session_Store**: The mechanism (Supabase or browser storage backed by Supabase sync) that persists in-progress UI state across page refreshes
- **Role_Simulator**: A UI control that lets a logged-in user switch between simulated personas (admin, marketer, viewer) without separate accounts
- **Seed_Script**: A CLI or application-level script that populates a Supabase database with a known-good set of demo data
- **Activity_Log**: A Supabase table that records page views and interaction events for each authenticated user
- **Changelog_Service**: The subsystem that tracks feature changes and displays a "what's new" banner to users who haven't seen the latest updates
- **Reviewer**: A colleague who has been given login credentials to access and evaluate the prototype

## Requirements

### Requirement 1: Supabase Integration and Data Layer

**User Story:** As the prototype maintainer, I want the prototype to read and write data from Supabase instead of local mock files, so that all reviewers share the same persistent dataset.

#### Acceptance Criteria

1. THE Data_Layer SHALL provide the same TypeScript interfaces currently exported by `src/data/` modules (accounts, campaigns, journeys, connections, contacts, segments, permissions, assets, users, treatments, products, notifications, field registry, operator registry, transactional data, SPA contacts, journey seeds)
2. WHEN the application starts, THE Data_Layer SHALL fetch initial data from Supabase and supply it to existing React contexts (AccountContext, CampaignsContext, JourneysContext, ConnectionsContext, ConnectorsContext, DataContext, PermissionsContext, AssetsContext)
3. WHEN a context performs a create, update, or delete operation, THE Data_Layer SHALL persist the change to Supabase and update local state to reflect the result
4. IF a Supabase query fails, THEN THE Data_Layer SHALL display a non-blocking toast notification with the error message and retain the previous local state
5. WHEN no Supabase connection is configured (missing environment variables), THE Data_Layer SHALL fall back to the existing local mock data so the prototype remains runnable without a backend

### Requirement 2: Authentication

**User Story:** As a reviewer, I want to log in with my own credentials, so that my session, feedback, and activity are attributed to me.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide email/password authentication using Supabase Auth
2. WHEN an unauthenticated user navigates to any prototype route, THE Auth_Service SHALL redirect the user to a login page
3. WHEN a user submits valid credentials on the login page, THE Auth_Service SHALL create an authenticated session and redirect the user to the page they originally requested
4. IF a user submits invalid credentials, THEN THE Auth_Service SHALL display an inline error message stating the credentials are incorrect
5. WHEN an authenticated session token expires, THE Auth_Service SHALL attempt a silent token refresh using the Supabase refresh token
6. IF the silent token refresh fails, THEN THE Auth_Service SHALL redirect the user to the login page
7. THE Auth_Service SHALL expose the current user's display name, email, and avatar initials to the application via a React context
8. WHEN a user clicks the logout action, THE Auth_Service SHALL end the session and redirect to the login page

### Requirement 3: Feature Flags

**User Story:** As the prototype maintainer, I want to hide incomplete pages and features behind flags, so that reviewers only see functionality that is ready for feedback.

#### Acceptance Criteria

1. THE Feature_Flag_Service SHALL store feature flags as key-value pairs in a Supabase table with columns for flag name, enabled status, and description
2. WHEN the application starts, THE Feature_Flag_Service SHALL fetch all feature flags and cache them in a React context
3. WHEN a feature flag is disabled, THE Feature_Flag_Service SHALL hide the corresponding navigation item and return a "coming soon" placeholder if the route is accessed directly
4. WHEN no feature flags table exists or the fetch fails, THE Feature_Flag_Service SHALL treat all features as enabled so the prototype remains fully functional
5. THE Feature_Flag_Service SHALL support page-level flags (one flag per route) and component-level flags (one flag per discrete UI capability)

### Requirement 4: Database Seeding and Dev Mode

**User Story:** As the prototype maintainer, I want a seeding mechanism that populates Supabase with realistic demo data, so that new reviewers start with a fully populated prototype.

#### Acceptance Criteria

1. THE Seed_Script SHALL insert the complete dataset currently defined in `src/data/` into the corresponding Supabase tables
2. WHEN the Seed_Script is executed, THE Seed_Script SHALL create pre-configured reviewer accounts with known credentials documented in the project README
3. THE Seed_Script SHALL be idempotent — running it multiple times SHALL produce the same database state without duplicating records
4. WHEN a reviewer clicks the "Reset Account" button in the prototype UI, THE Data_Layer SHALL restore that reviewer's data to the seeded baseline without affecting other reviewers' data
5. THE Seed_Script SHALL be executable via a single CLI command (e.g., `npm run seed`)

### Requirement 5: Feedback and Annotation Mode

**User Story:** As a reviewer, I want to leave contextual comments on specific pages, so that the prototype maintainer can see my feedback in context.

#### Acceptance Criteria

1. WHEN a reviewer activates feedback mode via a floating action button, THE Feedback_Service SHALL display a comment input anchored to the current page
2. WHEN a reviewer submits a comment, THE Feedback_Service SHALL store the comment in Supabase with the page route, the reviewer's user ID, a timestamp, and the comment text
3. WHEN a page with existing comments is loaded, THE Feedback_Service SHALL display a badge count on the feedback button indicating the number of comments for that page
4. THE Feedback_Service SHALL display a comment thread panel listing all comments for the current page, ordered by timestamp descending
5. WHEN a reviewer submits a comment with an empty body, THE Feedback_Service SHALL prevent submission and display a validation message
6. THE Feedback_Service SHALL allow the comment author to delete their own comments

### Requirement 6: Session State Persistence

**User Story:** As a reviewer, I want my in-progress work (open modals, form inputs, selected filters) to survive a page refresh, so that I don't lose context during a review session.

#### Acceptance Criteria

1. WHEN a reviewer navigates within the prototype, THE Session_Store SHALL persist key UI state (selected account, active filters, open panel states) to browser storage keyed by user ID
2. WHEN the prototype loads after a refresh, THE Session_Store SHALL restore the persisted UI state so the reviewer returns to their previous context
3. WHEN a reviewer logs out, THE Session_Store SHALL clear all persisted state for that user
4. THE Session_Store SHALL limit stored data to UI navigation state — it SHALL NOT duplicate Supabase data locally

### Requirement 7: Role Simulation

**User Story:** As a reviewer, I want to switch between simulated personas (admin, marketer, viewer) without logging out, so that I can evaluate the prototype from different user perspectives.

#### Acceptance Criteria

1. THE Role_Simulator SHALL provide a dropdown in the prototype UI that lists available personas: admin, marketer, and viewer
2. WHEN a reviewer selects a persona, THE Role_Simulator SHALL update the application's permission context to reflect that persona's access level
3. THE Role_Simulator SHALL persist the selected persona in the Session_Store so it survives page refresh
4. WHEN the prototype loads, THE Role_Simulator SHALL default to the admin persona
5. THE Role_Simulator SHALL display the active persona name in the navigation bar adjacent to the user avatar

### Requirement 8: Changelog and What's New Banner

**User Story:** As a reviewer, I want to see what changed since my last visit, so that I can focus my review on new or updated areas.

#### Acceptance Criteria

1. THE Changelog_Service SHALL maintain a list of changelog entries in a Supabase table with columns for entry ID, title, description, affected routes, and created date
2. WHEN a reviewer logs in and unseen changelog entries exist, THE Changelog_Service SHALL display a dismissible banner at the top of the page listing the new entries
3. WHEN a reviewer dismisses the banner, THE Changelog_Service SHALL record the latest seen entry ID for that user so the banner does not reappear for those entries
4. THE Changelog_Service SHALL provide a "What's New" link in the navigation that opens a panel showing the full changelog history

### Requirement 9: Activity Log

**User Story:** As the prototype maintainer, I want to see which pages and features reviewers are exploring, so that I can prioritise development based on actual usage patterns.

#### Acceptance Criteria

1. WHEN an authenticated reviewer navigates to a page, THE Activity_Log SHALL record the page route, user ID, and timestamp in a Supabase table
2. WHEN a reviewer performs a tracked interaction (opening a modal, creating a record, using a filter), THE Activity_Log SHALL record the interaction type, target identifier, and timestamp
3. THE Activity_Log SHALL provide a read-only admin view accessible to the prototype maintainer showing aggregated page visit counts and interaction frequency
4. THE Activity_Log SHALL batch write events to Supabase (debounced or queued) to avoid excessive network requests during normal browsing
5. THE Activity_Log SHALL not degrade prototype performance — logging SHALL be asynchronous and non-blocking

### Requirement 10: Hosting and Access

**User Story:** As a reviewer, I want to access the prototype via a URL without cloning the repository, so that I can review it from any machine.

#### Acceptance Criteria

1. THE Prototype SHALL be deployable to a static hosting platform (Vercel, Netlify, or similar) via a single build command (`npm run build`)
2. THE Prototype SHALL load environment variables for Supabase URL and anon key from a `.env` file that is excluded from version control
3. WHEN a reviewer accesses the hosted URL, THE Prototype SHALL serve the built application and present the login page
4. THE Prototype SHALL include a README section documenting how to clone, configure environment variables, seed the database, and run locally as an alternative to the hosted version
