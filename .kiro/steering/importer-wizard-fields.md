---
inclusion: fileMatch
fileMatchPattern: '**/importer/**'
---

# Importer Wizard — Field Rules Per Step

This document is the single source of truth for what fields appear on each step of the importer wizard. Consult this before adding, removing, or moving any field.

## Step 1: File Settings

### File Path section
Fields shown depend on the selected path mode:

| Field | Automatic | Base | Custom |
|---|---|---|---|
| Path mode toggle (Automatic/Base/Custom) | Yes | Yes | Yes |
| Folder Name input | Yes | No | No |
| Folders preview box (green) | Yes | No | No |
| Read Path (disabled, inherited) | No | Yes | No |
| Read Path (editable) | No | No | Yes |
| Error Folder Path | No | No | Yes |
| Archive Folder Path | No | No | Yes |
| File Name Pattern (inside path section) | **No** | **No** | **No** |

### Sample File section
- File upload dropzone (compact single-line) — always shown

### File Pattern section
- File Pattern input — **only shown for Base and Custom modes, hidden for Automatic**

### Importing To section
- Data type toggle (Contacts/Transactional/Both) — always shown, Contact preselected
- Select Table dropdown — always shown

## Step 2-3 (or 2-5): Config steps
- Contact Configuration or Transactional Configuration
- Uses shared ImportConfigStep component with `type` prop
- Contains: Update Type radios, Blank Values radios, Matching Fields chip input

## Step 3-4 (or 4-6): Mapping steps
- Placeholder for now

## Second-to-last step: Notifications
- Placeholder for now

## Last step: Review
- Placeholder for now

## Key Rules
- File Pattern is NEVER shown in Automatic mode — the system manages paths automatically
- File Name Pattern inputs inside the path mode sections were removed — only the standalone File Pattern row exists
- Contact is preselected by default when the wizard opens
- The segmented buttons use teal text (not filled background) for the active state
