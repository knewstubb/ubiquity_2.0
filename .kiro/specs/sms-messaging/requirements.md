# SMS & Messaging — Requirements (Lightweight)

## Overview
SMS composer for journey actions and direct sends. Character counting with segment indicator. Future: WhatsApp and RCS channels.

## Scope
- SMS composer: text input with character counter
- Segment indicator (160 char segments, multi-part message preview)
- Personalisation tokens: {{first_name}}, etc.
- Preview: how the message will appear on device
- Sender ID configuration
- Opt-out footer management
- Future channels: WhatsApp templates, RCS cards (placeholder for now)

## Sample Data
- Appointment reminder SMS, promotional SMS, booking confirmation

## Dependencies
- Journey Builder (SMS action node)
- Audience Management (phone number field)

## Depends On This
- Analytics (SMS delivery/open rates)

## Nav Location
- Opened from Journey Builder (modal), also browsable via Content > SMS
