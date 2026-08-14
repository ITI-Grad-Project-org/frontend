# Uply Frontend

<p align="center">
  <img src="public/Uply-light-logo.webp" alt="Uply logo" width="180" />
</p>

The frontend for **Uply**, a coaching platform that connects coaches with their clients in a single, elegant ecosystem. This repository is the coach-facing web app: a full dashboard for managing clients, building training and nutrition plans, tracking real-time progress, and staying on top of what every client actually finishes.

## What's Inside

**Planning & Building**
- **Training plans** — build multi-week programs day by day with a drag-and-drop builder: exercises, superset groups, rest/tempo, sets with rep ranges, RPE/RIR/1RM intensity, and rest days. Draft → publish → reschedule → cancel → archive lifecycle.
- **Nutrition plans** — mirror builder for meal plans: slot-based meals, foods with servings, per-day macro targets (calories, protein, carbs, fat, fiber, water), flexible days, and target-variance feedback before publish. Same publish/archive lifecycle as training plans.

**Tracking & Insights**
- **Exercise library** — searchable catalog of exercises with categories, primary/secondary muscles, equipment, and demo media; build new exercises on the fly right from the plan builder.
- **Food & meal library** — reusable meals and foods with full nutrient profiles for fast plan assembly.
- **Plan logs** — every day's workout log rolled up into charts: prescribed vs actual rep adherence, volume by exercise, set outcomes, dynamically sized so exercise names never clip.
- **Nutrition logs** — day outcomes, meal outcomes, daily calorie adherence, macro adherence, and water intake charts computed straight from the log data.
- **Reviews** — rating breakdown with a 1–5 star histogram alongside the average, plus the full review list.
- **Clients** — active clients, pending invitations, and join requests in one place, with client-base analytics (gender split + age buckets) on the active-clients tab.

**Coaching Workflow**
- **Chat** — real-time, socket.io-powered messaging thread per client.
- **Coach profile** — a public `/coach/:tenantId` page clients can be sent to, with certifications, transformation photos, pricing, specialties, and featured reviews.
- **Page-level charts** — plans, nutrition plans, clients, and reviews pages all render lightweight analytics derived client-side from data already in the query cache (no extra network calls).

## Tech Stack

- **Framework:** React 19 + TypeScript (strict, `verbatimModuleSyntax` + `erasableSyntaxOnly`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 with CSS-variable design tokens + shadcn/ui components
- **Data Visualization:** Recharts v3 via shadcn chart primitives, themed with the `--chart-1…6` palette
- **Data Fetching:** TanStack Query (per-combo cached queries), Zustand for auth state only
- **Forms:** React Hook Form + Zod schemas
- **Drag & Drop:** `@dnd-kit/react` v0.5 for the plan builders
- **Real-Time:** socket.io-client for coach–client chat
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
│   ├── plans/         Plans list, filters, stats, builder pieces, logs & charts
│   └── nutritionPlans/ Nutrition mirror of the above
├── pages/
│   ├── Homepage.tsx   Marketing landing (hero, features, pricing, testimonials)
│   ├── CoachProfile.tsx
│   ├── Profile.tsx
│   ├── auth/          Sign in, sign up, forgot/reset password
│   └── Dashboard/     Layout + Overview, Clients, Chat, Plans, Nutrition, …
├── hooks/             TanStack Query hooks, grouped by domain (plans/, nutritionPlans/, …)
├── services/          Axios API layer (one module per domain)
├── schemas/           Zod schemas + co-located options/constants
├── stores/            Zustand (auth session only)
├── lib/               api client, query client, image compression, token session
└── types/             Types mirroring backend responses
```

## Authentication

Axios + Zustand handle the coach auth flow. Access tokens live **only** in Zustand memory and Axios attaches them to protected requests; a `401` triggers an automatic `/auth/refresh` attempt. For persistent sessions the API sets an `HttpOnly`, `Secure` refresh cookie and allows credentialed requests (`withCredentials: true`); if the API returns a JSON `refreshToken` it's stored in `localStorage` as a browser-wide fallback and cleared on sign-out. The access token is never written to browser storage.

## Data & Chart Conventions

- **Query keys** are per filter combination (`["programs", params]`, `["nutrition-plans", params]`, …) with 5-minute staleness for heavy libraries; actions update the current view via `setQueryData` and mark other cached combos stale.
- **Charts** follow `docs/charts/CHART_THEME_GUIDE.md`: Recharts via `ChartContainer`/`ChartTooltip`/`ChartLegend`, semantic tokens only — never hardcoded hex.
- Modal overlays are hand-rolled `createPortal` + `.modal-overlay` — the shadcn `ui/dialog.tsx` is not used for them.

## Deployment

Vercel with SPA rewrites in `vercel.json` (project id, org id, and `projectName` in `.vercel/project.json`). Deploy production with:

```bash
npx vercel login  # once
npx vercel --prod
```