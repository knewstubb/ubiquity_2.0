# Typography

> **Last updated:** 2026-05-21
> **Font:** Inter (Google Fonts)

## Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| Display L | 48px | ~58px | Bold | Marketing pages only |
| Display M | 36px | ~44px | Bold | Marketing pages only |
| Heading H1 | 30px | ~36px | SemiBold | Page titles (rarely used — H2 is the standard page title) |
| Heading H2 | 24px | ~29px | SemiBold | Page titles, modal headers |
| Heading H3 | 20px | ~24px | SemiBold | Section headings |
| Heading H4 | 18px | ~22px | SemiBold | Card titles, subsection headings |
| Heading H5 | 16px | ~19px | SemiBold | Label headings, group titles |
| Body L | 18px | ~22px | Regular | Hero descriptions, onboarding text |
| Body Base | 16px | ~19px | Regular | Default body text (rarely used in app — Body S is standard) |
| Body S | 14px | ~17px | Regular | Standard body text, descriptions, table cells |
| Body XS | 12px | ~15px | Regular | Helper text, timestamps, metadata, badges |
| Body XXS | 10px | ~12px | Medium | Micro labels (use sparingly) |
| Button Standard | 16px | 16px | SemiBold | Large buttons |
| Button Small | 14px | 14px | Bold | Standard buttons, nav items |

## Design Decisions

1. **Body S (14px) is the default** — not Body Base (16px). The app is information-dense; 14px gives better density without sacrificing readability at screen distance.

2. **H2 (24px) is the page title size** — H1 exists in the scale but is rarely used in the app. Page headers use H2 for a quieter, more professional feel.

3. **SemiBold for headings, Regular for body** — no Bold in body text. Bold is reserved for inline emphasis (`<strong>`) and button labels.

4. **12px is the smallest readable size** — Body XS is the floor for any text that needs to be read. Body XXS (10px) is only for decorative labels or non-essential metadata.

5. **No italic in the UI** — italic is reserved for placeholder text in inputs. Never used for emphasis (use bold instead).

## Weight Usage

| Weight | Where |
|--------|-------|
| Regular (400) | Body text, descriptions, table cells |
| Medium (500) | Body XXS labels, some badge text |
| SemiBold (600) | Headings, button labels, nav items, field labels |
| Bold (700) | Button Small, inline emphasis only |

## Line Height Rule

All line heights are ~1.2× the font size (tight). This keeps the interface compact. Exception: body text in long-form content (help docs, tooltips) can use 1.5× for readability.
