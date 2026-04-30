---
inclusion: always
---

# Tech Stack — Hard Rules

React 19 + TypeScript + Vite

CSS Modules ONLY — never Tailwind, never CSS-in-JS, never inline styles

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
