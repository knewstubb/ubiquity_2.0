# Empty States

> **Last updated:** 2026-05-21

## Structure

Every empty state follows the same vertical stack:

1. **Icon** — Phosphor icon, Light weight, 48px, `text-muted-foreground`
2. **Headline** — H4 (18px SemiBold), action-oriented ("Connect your data source")
3. **Supporting text** — Body S (14px), `text-muted-foreground`, explains why this is empty and what to do
4. **Primary CTA** — Button (primary variant, large size)
5. **Help link** (optional) — Text link or popover trigger below the CTA

## Layout

- Centred horizontally and vertically within the content area
- Max-width: 400px for the text block
- Gap: 12px between icon and headline, 8px between headline and supporting text, 16px between text and CTA

## Design Decisions

1. **Action-oriented headlines** — "Connect your data source" not "No connections found". The headline tells the user what to do, not what's wrong.

2. **Light weight icons at 48px** — large enough to be a visual anchor, light weight so they don't dominate. Regular weight at 48px looks too heavy.

3. **Always provide a CTA** — empty states are onboarding moments. Every empty state has a button that starts the creation flow.

4. **Supporting text explains context** — not just "click the button to add one" but why this thing matters: "Automations require an active connection to your database or file storage."

5. **No illustrations** — Phosphor icons only. No custom SVG illustrations, no Lottie animations. Keeps the visual language consistent and maintainable.

## Examples

### Connectors page (no connections)
- Icon: PlugsConnected (48px, Light)
- Headline: "Connect your data source"
- Text: "Automations require an active connection to your database or file storage."
- CTA: "Create Your First Connection"
- Help: "View connection requirements" (popover)

### Segment list (no segments)
- Icon: FunnelSimple (48px, Light)
- Headline: "Create your first segment"
- Text: "Segments let you target specific groups of contacts based on their attributes and behaviour."
- CTA: "New Segment"
