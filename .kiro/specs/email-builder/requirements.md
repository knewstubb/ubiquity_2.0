# Email Builder — Requirements (Lightweight)

## Overview
Email editor opened as a full-screen modal overlay from within the Journey Builder. Block-based drag-and-drop editor for creating responsive emails with personalisation tokens.

## Scope
- Full-screen modal overlay (journey canvas visible behind)
- Block-based editor: text, image, button, divider, columns, spacer
- Drag-and-drop block reordering
- Rich text editing within blocks
- Personalisation tokens: {{first_name}}, {{company}}, etc.
- Subject line and preheader editing
- Template selection (start from template or blank)
- Preview: desktop and mobile toggle
- Send test email (simulated in prototype)
- Asset picker: insert images from asset library (modal within modal)

## Sample Data
- 2-3 email templates: welcome, promotional, transactional
- Sample content blocks with spa-themed imagery

## Dependencies
- Journey Builder (email builder opens from journey action node)
- Asset Management (image picker references asset library)

## Depends On This
- Analytics (email performance metrics)

## Nav Location
- Opened from Journey Builder (modal), also browsable via Content > Emails

## Reference
- Notion: Email Builder Requirements Research
