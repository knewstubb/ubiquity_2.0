# Notification & Alert System — Requirements (Lightweight)

## Overview
In-app notification centre for system alerts, anomaly detection, and workflow events. Bell icon in nav with unread count. Supports proactive AI-surfaced insights.

## Scope
- Notification bell in primary nav bar with unread badge
- Notification panel (slide-out or dropdown)
- Notification types: system (maintenance), workflow (journey paused), alert (anomaly detected), insight (AI suggestion)
- Read/unread state, mark all as read
- Click-through: notification links to relevant page (e.g. "Journey X has 50 stuck customers" → journey report)
- Notification preferences (which types to show — future)

## Sample Data
- 5-6 sample notifications: journey completed, import failed, anomaly detected, new contacts added

## Dependencies
- Journey Builder (journey event notifications)
- Analytics (anomaly alerts)
- Connector/Integration (import success/failure)

## Depends On This
- Nothing (cross-cutting UI component)

## Nav Location
- Bell icon in primary nav bar (always visible)
