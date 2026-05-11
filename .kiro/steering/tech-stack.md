---
inclusion: always
---

# Tech Stack — Hard Rules

React 19 + TypeScript + Vite

Styling — single system:
- Tailwind CSS is the single styling mechanism for all components
- `cn()` utility from `src/lib/utils.ts` for conditional class composition
- `src/styles/globals.css` is the single source of truth for design tokens
- No CSS Modules, no CSS-in-JS, no inline styles
- Preflight disabled — no global resets from Tailwind

Phosphor Icons from @phosphor-icons/react

React Router v6 for all navigation

Supabase for persistence + auth

Vitest for tests

File locations:
- Pages → src/pages/
- Components → src/components/{feature}/
- Data → src/data/
- Models → src/models/
- Routes → src/App.tsx
- Nav → src/components/layout/AppNavBar.tsx
