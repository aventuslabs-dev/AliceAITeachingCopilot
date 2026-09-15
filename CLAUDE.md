# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

MVP for an international school (English-medium, majority Chinese-L1 students). The teacher who this is being built for teaches Computer Science-type subjects from Primary 1 to Secondary 2 (ages 7–14) and currently spends ~80% of his time on lesson planning.

**MVP #1 (current focus): an AI lesson planning assistant.** Input a topic/subject, class level, week type (Week 1 = fundamentals + in-class exercises; Week 2 = deepen + harder exercises/homework), and duration; generate a structured lesson plan (objectives → warm-up → teaching content → in-class exercises → homework) calibrated for the student age and for English-L2/Chinese-L1 learners. The teacher edits/regenerates sections and saves to a lesson library (by class + topic + week), exportable as doc/PDF.

Explicitly **out of scope for now**: homework submission portal, AI marking/grading, gradebook, and gamification (leaderboards, points, challenges). These are later phases pending school-level buy-in and infra decisions (student accounts, auth, data policy) — do not scope-creep into them.

The codebase is currently a bare `create-next-app` scaffold with no custom pages, components, or backend built yet.

## Commands

```bash
npm run dev     # start dev server (Next.js, default port 3000)
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint (eslint-config-next: core-web-vitals + typescript)
```

There is no test runner configured yet — do not assume `npm test` works.

## Architecture

- **Next.js 16 App Router**, React 19, TypeScript (strict mode), Tailwind CSS v4.
- Source lives under `src/app/` (App Router convention: `layout.tsx`, `page.tsx`, `globals.css`). No `src/components/`, `src/lib/`, or API routes exist yet — as features are added, follow App Router conventions (`app/api/.../route.ts` for route handlers, colocated `page.tsx`/`layout.tsx` per route segment).
- Path alias `@/*` maps to `src/*` (configured in `tsconfig.json`).
- Tailwind v4 is configured via `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css` (no separate `tailwind.config.*` file — v4 style). Light/dark theming uses CSS custom properties (`--background`, `--foreground`) switched via `prefers-color-scheme`.
- Fonts: Geist Sans/Mono loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables.
