# TrudyM AI — Workplace Productivity Assistant

TrudyM AI is a modern, responsive web application that helps professionals automate everyday workplace tasks with artificial intelligence. It brings together email drafting, task planning, and an AI chat assistant into a single clean workspace — no login required and no data leaves the browser.

## Project overview

TrudyM acts as your AI workplace productivity partner. The app lets professionals generate workplace content, organise workloads, and receive AI-powered assistance through an intuitive dashboard. Everything runs in a privacy-first architecture: AI generation happens through secure server functions, while user-generated content and preferences are stored locally in the browser.

Key value propositions:

- **All-in-one workspace** — email generator, task planner, and AI chat in one place.
- **Privacy-first** — no signup, no database for user content, local browser storage only.
- **Professional output** — tailored tone, audience, and length controls for workplace communication.
- **Responsive design** — works on desktop, tablet, and mobile.
- **Responsible AI** — clear notices and guidelines for safe, transparent AI use.

## Features implemented

- **Smart Email Generator**
  - Draft professional emails by purpose, audience, tone, and length.
  - Audiences: Client, Manager, Team Member, Human Resources, Supplier, General Business Contact.
  - Tones: Formal, Friendly, Informal, Professional, Persuasive, Follow-up, Apologetic.
  - Copy, download as text, edit inline, and save locally.

- **AI Task Planner**
  - Generate realistic daily or weekly work plans.
  - Enter goals, working hours, and notes.
  - Output includes priorities, time estimates, deadlines, breaks, and productivity recommendations.
  - Copy, download as Markdown, print, edit, and save locally.

- **TrudyM Chat Assistant**
  - Streaming AI chat for summarising, rewriting, brainstorming, explaining concepts, and answering workplace questions.
  - Persistent local chat history.

- **Dashboard**
  - Hero section with quick-start actions.
  - Feature cards, session stats, productivity tips, and recent activity.

- **History**
  - View, search, and manage locally saved emails, plans, and chat sessions.

- **Settings & Help**
  - Theme preferences, local data management, and help/support information.

- **UI/UX**
  - Collapsible sidebar navigation, top bar with search and notifications, responsive layout.
  - Dark and light theme support.
  - Responsible AI notices on AI-powered features.

## Technologies and tools used

- **Framework:** [TanStack Start v1](https://tanstack.com/start) — full-stack React framework with SSR/edge support.
- **Language:** TypeScript 5
- **UI library:** React 19
- **Styling:** Tailwind CSS v4 with CSS-first theme variables
- **Components:** shadcn/ui primitives (Radix UI + custom components)
- **Routing:** TanStack Router (file-based routing)
- **Data & state:** TanStack Query, React `useState`, local browser storage
- **Server functions:** `createServerFn` from `@tanstack/react-start`
- **Build tool:** Vite 7
- **AI:** Lovable AI Gateway via `@ai-sdk/openai-compatible` and the `ai` SDK
- **Utilities:** Zod (validation), date-fns, Lucide icons, Sonner toasts
- **Code quality:** ESLint, Prettier

## Setup instructions

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A Lovable API key for AI features

### Install dependencies

```bash
bun install
```

### Environment variables

Create a `.env` file in the project root and add your Lovable API key:

```env
LOVABLE_API_KEY=your_lovable_api_key_here
```

The key is used server-side by the AI generation functions and is never exposed to the browser.

### Run the development server

```bash
bun dev
```

The app will be available at `http://localhost:8080` by default.

### Build for production

```bash
bun run build
```

### Preview the production build

```bash
bun run preview
```

### Lint and format

```bash
bun run lint
bun run format
```

## Notes

- This project is designed to run on Lovable Cloud / an edge runtime.
- All user-generated emails, plans, and chats are stored in the browser's local storage. Clearing browser data will remove saved content.
- The AI assistant is referred to throughout the app as **TrudyM** to maintain a consistent brand identity.
