---
inclusion: manual
---

# Feature Authoring Standards

## Your Role

You write Feature-level tickets. Not PBIs, not technical tasks. A Feature describes a complete user outcome that can be demonstrated independently. The delivery manager and dev team break Features into PBIs — that's their job, not yours.

## The Account Manager Test

Before writing a Feature, ask: "Would an account manager understand this and see value in it?" If the answer is no, you're either too technical or too granular.

## What Constitutes a Feature

A Feature is ONE thing if:
- You can describe it in one sentence from the user's perspective
- You can demo it start-to-finish without needing another feature to exist first
- An account manager would nod and say "yes, that's one thing"

It becomes MULTIPLE Features if:
- There are distinct user outcomes that could ship independently
- One part has value without the other
- You'd demo them as separate things to a stakeholder

## Feature Ticket Structure

### Title
Action-oriented, user-facing. What the user can do.
- "Create a Connection to an External System"
- "Set Up an Import Automation"
- "View and Export Integration Billing Data"

### User Story
One sentence. **When** [context], **I want** [action], **So that** [outcome].

### Context
One short paragraph. Why this matters to the business. No technical details. Written so an account manager understands it.

### Design Reference
- **Prototype**: Link to the live prototype page/flow
- **Figma**: Link to the component library or specific frame
- Note: "The prototype is the design spec. Developers can inspect component structure via the git repo."

### Expected Behaviours
Bullet list of what the user observes. Each bullet is one observable thing. Written in plain language.

Rules for behaviours:
- Describe what the user SEES and what HAPPENS
- Never mention APIs, databases, functions, or technical implementation
- Include conditional behaviours ("When X, then Y")
- Include edge cases the user would notice ("If no connections exist, the page shows...")
- Include validation the user would see ("If the name is empty, the button is disabled")

### Acceptance Criteria
Maximum 8 broad criteria. Each one is a user-observable outcome that can be verified by clicking through the prototype.

Rules for AC:
- Start with a verb: "User can...", "System shows...", "Page displays..."
- Never include technical criteria (API returns X, database stores Y)
- Never include testing criteria (that's the DM's job)
- Each criterion should be verifiable by a non-technical person using the product

### Scope
What's explicitly IN and what's explicitly OUT. This prevents scope creep and helps the DM know where to draw the line when creating PBIs.

### Dependencies (optional)
Only if this Feature genuinely cannot start until another Feature is complete. Don't list technical dependencies — the DM handles those.

## What Does NOT Go in Your Tickets

- Technical implementation details (which API, which database table)
- Testing criteria (unit tests, integration tests, property tests)
- Architecture decisions (microservice vs monolith, which queue)
- Performance requirements (response time, throughput)
- Security implementation (auth tokens, encryption method)
- Definition of Done (that's a team-level agreement, not per-ticket)

The delivery manager adds technical context when breaking into PBIs. The devs add implementation details when picking up work.

## Example Feature Ticket

```
Title: Create a Connection to an External System

User Story:
When I need to import data into UbiQuity, I want to create a 
connection to my external storage system, so that automations 
can read files from it.

Context:
Connections are the foundation of the integrations system. A user 
must establish a connection before they can create any automations. 
Each connection represents credentials and a path to one external 
system (AWS S3, Azure Blob Storage, or SFTP).

Design Reference:
- Prototype: [UbiQuity Prototype](https://ubiquity-prototype.netlify.app) — Integrations page > New Connection
- Figma: [Connection Management section](https://www.figma.com/design/ibejYyOiw8E1VjmWJAyvdC/Ubiquity-2.0?node-id=3467-22043)

Expected Behaviours:
- User clicks "New Connection" to open the creation flow
- Step 1: User enters a connection name, selects a type 
  (AWS S3, Azure Blob, SFTP), and enters a base path
- Step 2: User enters credentials specific to the selected type
  - AWS S3: region, bucket name, access key or IAM role
  - Azure Blob: container name, account name, SAS token
  - SFTP: hostname, port, username, password or SSH key
- User must test the connection before creating it
- Test shows a progress indicator then "Connected ✓" on success
- "Create Connection" button is disabled until the test passes
- On creation, the connection appears in the integrations list 
  under the current account
- If the connection fails later, it shows an error state with 
  "Connection Error. Automations Cannot Run"

Acceptance Criteria:
- [ ] User can create a connection with valid credentials for 
      each supported type (S3, Azure Blob, SFTP)
- [ ] Connection test must pass before creation is allowed
- [ ] New connection appears in the list immediately after creation
- [ ] Connection is scoped to the account it was created under
- [ ] Error state is visible when a connection fails
- [ ] User can edit an existing connection (with warning about 
      impact on automations)
- [ ] User can delete a connection (only when no automations 
      are attached)

Scope:
- IN: Create, edit, delete connections. Test connection. Error states.
- OUT: Connection health monitoring/alerts. Automatic reconnection. 
  Connection sharing between accounts.
```

## Splitting Guidance

Split when you find yourself writing more than 8 AC or the behaviours list exceeds ~15 bullets. That usually means you're describing two user outcomes in one ticket.

Common splits:
- "Create X" and "Manage X" (create vs edit/delete/view)
- "Basic flow" and "Advanced options" (if advanced options could ship later)
- "Happy path" and "Error handling" (only if error handling is complex enough to be its own demo)

## ADO Conventions

- Work item type: Feature
- Area Path: Spark\Tribes\No Tribe\UbiQuity Teams\CX-AI Team
- Priority: 2
- State: Under Assessment
- Parent: the relevant Epic
- Format: HTML for new items (check multilineFieldsFormat for existing)
- Always set Area Path explicitly
