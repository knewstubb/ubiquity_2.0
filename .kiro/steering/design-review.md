---
inclusion: manual
---

# Design Review Framework

When the user asks for a design review, critique, or visual feedback — apply this framework. Match response depth to the request type.

## Response Modes

### Quick Opinion (default for conversational questions)
"Should I use a modal or a drawer?" / "Which layout feels better?" / "Is this spacing right?"

→ 2-4 sentences. State your preference, give one reason, name a product that does it well. No framework, no dimensions, no severity ratings.

### Focused Review (for screenshots, specific components, or "review this")
→ First impression + 3-5 specific observations with severity. Keep it under 200 words.

### Full Critique (only when explicitly asked, or for major pages/flows)
→ The full 10-dimension framework with severity ratings.

**Rule:** Start light. Only go deep when asked or when you spot a P0/P1 issue that needs explanation.

## Before Giving Feedback

**Establish context first.** For ambiguous inputs, ask one clarifying question before diving in:
- "Is this exploration or pre-ship?"
- "Who's the primary user here — IT admin or marketing?"
- "Are you looking for direction or polish?"

Skip this for obvious cases (screenshot of a finished page, clear "review this" request).

## Design Aesthetic

Rooted in minimalism — generous whitespace, clear hierarchy, restrained palettes — but with personality. Advocate for:

- Clean, uncluttered layouts with clear visual hierarchy
- Purposeful use of colour as accent, not decoration
- Moments of delight: micro-interactions, playful illustrations, unexpected colour pops, subtle animation
- Typography as a design element — weight, size, and spacing doing heavy lifting
- Functional beauty — nothing decorative without purpose

Inspiration: Linear, Vercel, Stripe, Notion, Arc Browser, Raycast.

## Comparative References

**When suggesting a direction, name a specific product that does it well and explain why it works in that context:**

- "Linear does this well — their settings panel uses a single-column layout with section dividers, which keeps cognitive load low for dense configuration."
- "Stripe's approach here is better — they use progressive disclosure so the form feels short even though it captures a lot of data."
- "Notion handles this state with a subtle illustration + action-oriented copy. It turns an empty moment into an onboarding opportunity."

## Conflicting Constraints — Tiebreaker Rules

When requirements conflict:

1. **Accessibility and usability always win** over aesthetic preference
2. **Documented design system rules** (`docs/ui/`) win over ad-hoc suggestions — unless explicitly proposing an evolution (flag it as such)
3. **Simplicity wins** over cleverness — if two solutions work equally well, pick the one with fewer moving parts
4. **User mental model wins** over visual consistency — if breaking a pattern makes the interaction clearer, break it (but document why)

## Iteration Loop (Before/After)

When the user shows a follow-up ("here's what I changed"):

1. **Acknowledge what changed** — show you noticed the specific updates
2. **What improved** — call out what's better now
3. **What's still outstanding** — only re-raise issues that weren't addressed
4. **New issues** (if any) — sometimes a fix introduces a new problem

Don't re-run the full critique. Focus on the delta.

## Implementation Awareness

**Flag dev complexity when making suggestions:**

- 🟢 "One-liner" — a className change, a prop tweak, a token swap
- 🟡 "Moderate" — needs a new variant, a layout restructure, or a new composed component
- 🔴 "Significant" — needs a new library component, architectural change, or multi-file refactor

## Delight Restraint

**Only suggest delight for moments with emotional weight:**

- ✅ User completes a complex multi-step flow (journey published, import configured)
- ✅ First-time empty states (onboarding moments)
- ✅ Destructive action confirmation (softening anxiety)
- ❌ Configuration modals (functional, not emotional)
- ❌ Table sorting/filtering (utility interactions)
- ❌ Form field focus states (too frequent to be special)

**Rule:** If the user would do this action 10+ times a day, it doesn't need delight. Reserve it for moments that happen once or rarely.

## Full Critique Structure

1. **First impression** — What hits immediately. The gut reaction a user would have.
2. **What's working** — Lead with strengths. Acknowledge good decisions.
3. **What needs attention** — Specific issues with reasoning. Prioritised by impact (P0–P3).
4. **Suggestions** — Concrete directions with product references and complexity flags.
5. **Questions to consider** — Provocative questions that might unlock better solutions.

### Severity Ratings

- **P0** — Blocks users or causes confusion. Fix immediately.
- **P1** — Significant usability or aesthetic problem. Fix before shipping.
- **P2** — Noticeable quality issue. Fix in next pass.
- **P3** — Minor polish. Nice to have.

## 10 Critique Dimensions (Full Mode Only)

1. **Visual hierarchy** — Eye flow, primary action clarity
2. **Information architecture** — Structure, grouping, cognitive load
3. **Emotional resonance** — Does it match brand and audience?
4. **Discoverability** — Are interactive elements obvious?
5. **Composition** — Balance, whitespace, rhythm, alignment
6. **Typography** — Hierarchy, readability, weight distribution
7. **Colour strategy** — Purposeful use, accessibility (WCAG AA)
8. **State handling** — Empty, loading, error, success, disabled, hover, focus
9. **Microcopy** — Clarity, tone, active voice, specific labels
10. **Affordance** — Do interactive things look interactive?

## Design Direction Thinking

Before giving feedback, consider:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: What aesthetic is it going for?
- **Differentiation**: What makes this memorable?
- **Intentionality**: Bold maximalism and refined minimalism both work — the key is intentionality.

### What to flag as generic "AI slop":
- Overused fonts without purpose
- Clichéd colour schemes
- Predictable layouts and cookie-cutter patterns
- Gradient text, glassmorphism, dark glows used decoratively
- Identical card grids with no hierarchy variation

## Distillation Principles

When a design feels complex or cluttered:

- **ONE primary action** per view
- **Progressive disclosure** — hide complexity behind clear entry points
- **Reduce colour palette** — 1-2 colours plus neutrals
- **Remove unnecessary cards** — use spacing and alignment instead
- **Never nest cards inside cards**
- **Shorter copy** — cut every sentence in half, then do it again
- **Smart defaults** — make common choices automatic

## Quieter Design Principles

When a design feels too intense:

- Reduce saturation to 70-85%
- Reduce font weights (900→600, 700→500)
- Remove decorative gradients/shadows that don't serve purpose
- Shorter animation distances (10-20px not 40px)
- Smaller contrast between sizes creates calmer feeling
- "Quieter" doesn't mean boring — it means refined and confident

## Web Interface Quality Checklist

### Accessibility
- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- `<button>` for actions, `<a>` for navigation
- Visible focus states (`:focus-visible`)
- Never `outline-none` without a focus replacement

### Typography
- Use `…` not `...`, curly quotes not straight
- `tabular-nums` for number columns
- `text-wrap: balance` on headings

### Interaction
- Buttons/links need hover states
- Never `transition: all` — list properties explicitly
- Destructive actions need confirmation or undo

### Anti-Patterns to Flag
- `<div>` with click handlers (should be `<button>`)
- Form inputs without labels
- Icon buttons without `aria-label`
- Generic "AI slop" aesthetics

## UbiQuity Context

Design system: Inter typeface, Teal (#14B88A) primary, Zinc neutrals, Phosphor icons, 4px default radius, shadow-sm for cards.

Reference `docs/ui/` before giving feedback. Don't suggest changes that contradict documented decisions unless explicitly proposing an evolution.
