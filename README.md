# Uply Frontend

<p align="center">
  <img src="public/Uply-light-logo.webp" alt="Uply logo" width="180" />
</p>

The frontend for **Uply**, a coaching platform that connects coaches with their clients in a single, elegant ecosystem. This repository is the coach-facing web app: a full dashboard for managing clients, building training and nutrition plans, tracking real-time progress, and staying on top of what every client actually finishes.

## What's Inside

**Planning & Building**
- **Training plans** — build multi-week programs day by day with a drag-and-drop builder: exercises, superset groups, rest/tempo, sets with rep ranges, RPE/RIR/1RM intensity, and rest days. Draft → publish → reschedule → cancel → archive lifecycle, including archiving drafts straight from the builder.
- **Nutrition plans** — mirror builder for meal plans: slot-based meals, foods with servings, per-day macro targets (calories, protein, carbs, fat, fiber, water), flexible days, and target-variance feedback before publish. Same publish/archive lifecycle as training plans.
- **AI-assisted planning** — request AI-generated training and nutrition plan suggestions, then review, edit, and convert them into plan drafts. Polls a background task until the suggestion is ready.

**Tracking & Insights**
- **Practice analytics** — a dedicated tabbed analytics page: an attention band surfacing clients needing attention (missed logs, pending measurement reviews), adherence dials per client, an activity timeline, a roster leaderboard, program effectiveness and template survival charts derived from log data, plus client outcomes panels with strength progression and measurement reviews.
- **Measurement reviews** — unreviewed client measurements (new values + before/after photos) surfaced on the analytics attention band and the client profile, so coaches can review and feed back with one click.
- **Client profile** — dedicated per-client page with measurements history, deltas vs the previous entry, and strength outcome tracking.
- **Exercise library** — searchable catalog of exercises with categories, primary/secondary muscles, equipment, and demo media; build new exercises on the fly right from the plan builder.
- **Food & meal library** — reusable meals and foods with full nutrient profiles for fast plan assembly.
- **Plan logs** — every day's workout log rolled up into charts: prescribed vs actual rep adherence, volume by exercise, set outcomes, dynamically sized so exercise names never clip. Shared `LogVisuals` chart primitives power these (no recharts here).
- **Nutrition logs** — day outcomes, meal outcomes, daily calorie adherence, macro adherence, and water intake charts computed straight from the log data.
- **Reviews** — rating breakdown with a 1–5 star histogram alongside the average, plus the full review list.
- **Clients** — active clients, pending invitations, and join requests in one place, with client-base analytics (gender/age visualizations) on the active-clients tab.

**Coaching Workflow**
- **Dashboard home** — daily briefing with a morning greeting, a what-needs-a-decision summary, pulse stat cards, a live activity timeline, and recent active clients with last-seen times.
- **Chat** — real-time, socket.io-powered messaging thread per client, with a live unread badge in the nav, mobile menu, sidebar, and browser tab title.
- **Unified media lightbox** — photos (including transformation and certification images) open in a single lightbox built on `yet-another-react-lightbox`.
- **Coach profile** — a public `/coach/:tenantId` page clients can be sent to, with certifications, transformation photos, pricing, specialties, and featured reviews; tenant rename is available from the profile and setup wizard.
- **Auth** — password sign-in/up plus Google sign-in, with new accounts routed through a profile setup wizard (timezone/currency, sports/specialties).
- **Page-level charts** — plans, nutrition plans, clients, and reviews pages all render lightweight analytics derived client-side from data already in the query cache (no extra network calls).

## Tech Stack

- **Framework:** React 19 + TypeScript (strict, `verbatimModuleSyntax` + `erasableSyntaxOnly`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 with CSS-variable design tokens + shadcn/ui components
- **Data Visualization:** Recharts v3 via shadcn chart primitives, themed with the `--chart-1…6` palette
- **Data Fetching:** TanStack Query (per-combo cached queries), Zustand for auth state only
- **Forms:** React Hook Form + Zod schemas
- **Drag & Drop:** `@dnd-kit/react` v0.5 for the plan builders
- **Real-Time:** socket.io-client for coach–client chat and unread-message badge sync
- **Media:** `yet-another-react-lightbox` for unified photo previews
- **Icons:** Lucide

## Getting Started

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` when pointing at a different API server; `.env.example` contains the default API URL.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run lint` | ESLint across the repo |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run vitest (suite in progress) |

## Project Structure

```
src/
├── components/        Reusable UI, cards, modals, charts, domain components
│   ├── cards/         CardMain, CardInk, StatCard, ClientCard, …
│   ├── modals/        Hand-rolled createPortal overlays (invite, create plan, …)
│   ├── ui/            shadcn/ui primitives (chart, card, dialog, …)
│   ├── analytics/     Practice analytics tabs (attention, adherence, roster, programs)
│   ├── clients/       Client profile, measurements panels
│   ├── plans/         Plans list, filters, stats, builder pieces, logs & charts
│   └── nutritionPlans/ Nutrition mirror of the above
├── pages/
│   ├── Homepage.tsx   Marketing landing (hero, features, pricing, testimonials)
│   ├── CoachProfile.tsx
│   ├── Profile.tsx
│   ├── auth/          Sign in (password + Google), sign up, forgot/reset password
│   └── Dashboard/     Layout + Overview, Analytics, Clients, ClientProfile, Chat,
│                      AISuggestions, Plans, Nutrition, …
├── hooks/             TanStack Query hooks, grouped by domain (ai/, analytics/, plans/, …)
├── services/          Axios API layer (one module per domain)
├── schemas/           Zod schemas + co-located options/constants
├── stores/            Zustand (auth session only)
├── lib/               api client, query client, image compression, token session
└── types/             Types mirroring backend responses
```

## Authentication

Axios + Zustand handle the coach auth flow. Access tokens live **only** in Zustand memory and Axios attaches them to protected requests; a `401` triggers an automatic `/auth/refresh` attempt. For persistent sessions the API sets an `HttpOnly`, `Secure` refresh cookie and allows credentialed requests (`withCredentials: true`); if the API returns a JSON `refreshToken` it's stored in `localStorage` as a browser-wide fallback and cleared on sign-out. The access token is never written to browser storage. Google sign-in is supported and routes new accounts through the profile setup wizard.

## Data & Chart Conventions

- **Query keys** are per filter combination (`["programs", params]`, `["nutrition-plans", params]`, …) with 5-minute staleness for heavy libraries; actions update the current view via `setQueryData` and mark other cached combos stale.
- **Charts** follow `docs/charts/CHART_THEME_GUIDE.md`: Recharts via `ChartContainer`/`ChartTooltip`/`ChartLegend`, semantic tokens only — never hardcoded hex. Plan/nutrition log charts instead use shared `LogVisuals` primitives.
- Modal overlays are hand-rolled `createPortal` + `.modal-overlay` — the shadcn `ui/dialog.tsx` is not used for them.
- Each dashboard route sets its own document title (and an unread-message count when chat is open).

## Deployment

Vercel with SPA rewrites in `vercel.json` (project id, org id, and `projectName` in `.vercel/project.json`). Deploy production with:

```bash
npx vercel login  # once
npx vercel --prod
```