Add a `README.md` at the project root that documents the TrudyM AI Workplace Productivity Assistant application.

Sections to include:

1. **Project overview**
   - Name: TrudyM AI — AI Workplace Productivity Assistant
   - One-paragraph description of what the app does
   - Key value props: professional content generation, workload organisation, AI chat assistance, privacy-first local storage, no login required

2. **Features implemented**
   - Smart Email Generator (audience, tone, length controls, copy/download/save)
   - AI Task Planner (daily/weekly plans, working hours, notes, copy/download/print/save)
   - TrudyM Chat Assistant (streaming AI chat for summarisation, rewriting, brainstorming, explanations)
   - Dashboard (feature cards, session stats, quick actions, productivity tips, recent activity)
   - History (locally saved emails, plans, chats)
   - Settings + Help & Support pages
   - Responsive sidebar/top-bar layout
   - Dark/light theme support
   - Responsible AI notices

3. **Technologies and tools used**
   - TanStack Start v1 (full-stack React framework)
   - React 19 + TypeScript
   - Tailwind CSS v4 + shadcn/ui components
   - TanStack Router (file-based routing)
   - TanStack Query + server functions (`createServerFn`)
   - Vite 7
   - Lovable AI Gateway (`@ai-sdk/openai-compatible`, `ai` SDK)
   - Local browser storage for persistence
   - ESLint + Prettier

4. **Setup instructions**
   - Prerequisites: Node.js / Bun
   - Clone / install: `bun install`
   - Environment variable: `LOVABLE_API_KEY` needed for AI generation
   - Run dev: `bun dev`
   - Build: `bun run build`
   - Preview: `bun run preview`
   - Lint/format commands

Also note that the app is designed to run on Lovable Cloud / edge runtime and stores all user data locally in the browser.