# Lane

A focused **pull request review inbox** — a limited-scope, production-quality
clone of the Graphite review workflow. Lane reproduces four screens:

1. **Inbox / Review Dashboard** — PRs grouped into sections, virtualized.
2. **Pull Request Overview** — description, reviews, checks, activity, merge status.
3. **Pull Request Review / Diff Viewer** — file tree, unified & side-by-side diffs,
   viewed tracking, inline + pending comments, review submission.
4. **Edit Section Drawer** — section name, repository scoping, and an AND/OR
   filter builder with multiple groups.

The goal is to match the **workflow and UX**, with an original visual design
(dark-first, a violet accent, and a monospace "data language" for PR numbers,
branches and diff stats).

> **Runs with zero setup.** Lane starts in **demo mode** with realistic sample
> data and no GitHub app required. Add OAuth credentials when you want live data.

---

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev
# open http://localhost:3000  →  redirects to /inbox
```

That's it. You'll land in the demo with sample repositories, PRs across every
review state, diffs, and an editable filter drawer.

> `--legacy-peer-deps` is used because the project tracks React 19 while a few
> libraries still declare React 18 peers.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Next.js lint |
| `npm run typecheck` | `tsc --noEmit` (strict) |

---

## Connect live GitHub

Lane talks **directly to the GitHub APIs** (GraphQL first, REST where GraphQL
can't help, e.g. unified diffs). There is **no database and no persistence** —
every screen derives its data from GitHub at request time, and review states
are computed at runtime.

1. Create an OAuth app at **GitHub → Settings → Developer settings → OAuth Apps**.
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
2. Put the credentials in `.env.local` and disable demo mode:
   ```bash
   AUTH_SECRET=...            # npx auth secret
   AUTH_GITHUB_ID=...
   AUTH_GITHUB_SECRET=...
   # MOCK_DATA=true           # remove or comment this out
   ```
3. Restart `npm run dev` and sign in. Lane requests the `repo` and `read:user`
   scopes so it can read pull requests and submit reviews on your behalf.

Demo mode is on whenever `AUTH_GITHUB_ID` is missing **or** `MOCK_DATA=true`.

---

## Architecture

A **single Next.js 15 app** (App Router) — no separate backend, queue, or
worker. Data access lives in server-only modules and is exposed through Route
Handlers and Server Actions.

```
app/
  (app)/                     authenticated shell + screens
    layout.tsx               fetches viewer + repos, renders AppShell
    inbox/                   Inbox dashboard (RSC → client island)
    pr/[owner]/[repo]/[number]/        Overview
    pr/[owner]/[repo]/[number]/review/ Diff viewer
  api/                       Route Handlers (prs, pr detail, auth)
  actions/                   Server Actions (submit review, comment)
  login/                     GitHub sign-in / demo entry
components/
  layout/                    app shell, repo switcher, theme toggle
  inbox/                     sidebar, virtualized list, PR row, sort, states
  drawer/                    edit-section drawer + filter builder
  pr/                        overview, reviews, checks, timeline, composer
  pr/diff/                   file tree, diff file/line, inline comments, toolbar
  ui/                        design-system primitives (button, badge, drawer…)
lib/                         cn/format helpers, diff parser, syntax highlighter
services/
  github/                    typed client (dedupe, pagination, rate limits),
                             GraphQL queries, REST fallbacks, PR mapping, mocks
  filters/                   extensible filter field registry + engine
  review/                    runtime review classification + section resolution
store/                       Zustand stores (sections, UI/theme/diff/sort)
hooks/                       TanStack Query hooks
types/                       shared PR domain types
```

### Key modules

- **`services/github/client.ts`** — reusable client with request **deduplication**,
  cursor **pagination**, **rate-limit** tracking, retry-with-backoff on 403/429,
  and typed errors.
- **`services/review/classify.ts`** — derives `waiting_for_review` /
  `waiting_for_author` / `approved` / `merged` / `draft` from GitHub signals
  rather than hardcoding them.
- **`services/filters/`** — a field registry (`FIELD_DESCRIPTORS`) plus an
  AND/OR evaluation engine; add a field in one place to extend the builder.
- **`lib/diff.ts` / `lib/highlight.ts`** — a small unified-diff parser and a
  dependency-free syntax highlighter (swap in Shiki/Prism later with no API
  changes).

### Stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind CSS · TanStack Query ·
Zustand · React Virtuoso · Framer Motion · Auth.js (GitHub OAuth) · lucide-react.

---

## Keyboard

Lane is keyboard-driven. Press <kbd>?</kbd> on the inbox or the diff viewer for
the full list.

**Inbox:** `j` / `k` move between PRs · `Enter` open · `/` search · `e` edit the
current section · `r` refresh · `?` help.

**Diff viewer:** `j` / `k` move between files · `v` toggle viewed · `u` unified ·
`s` side-by-side · `?` help.

Shortcuts are suppressed while typing in a field, so they never fight with forms.

---

## Deploying to production

Lane is a standard Next.js app and deploys anywhere Next.js runs (Vercel,
Docker, a Node host).

1. Set environment variables on the host (do **not** ship `.env.local`):
   ```bash
   AUTH_SECRET=...            # npx auth secret
   AUTH_GITHUB_ID=...
   AUTH_GITHUB_SECRET=...
   # AUTH_TRUST_HOST=true     # only if not on Vercel; already on via config
   ```
   Update the OAuth app's callback URL to your production domain
   (`https://your-domain/api/auth/callback/github`).
2. Build and start:
   ```bash
   npm ci --legacy-peer-deps
   npm run build
   npm run start
   ```

Auth.js runs with `trustHost: true` so sessions work behind a proxy out of the
box. With real credentials present, demo mode turns off automatically and every
screen reads live GitHub data; the middleware then protects all app routes.

---

## Behavior notes & honest scope

This is a focused MVP built for code quality and the core review workflow.

- **Demo mode is a deliberate design choice, not persistence.** Fixtures are
  static and read-only, which keeps the "no database" guarantee while letting
  the app render fully with zero setup. With OAuth set, it reads live data.
- **Covered end-to-end:** GitHub-derived review classification, the four
  screens, the AND/OR filter builder, virtualization, sorting, inbox search,
  full keyboard navigation, dark/light themes, responsive layout (the inbox
  sidebar collapses to a slide-over on mobile), and loading / empty / **error**
  states (route-level error boundaries + typed messages for rate-limit and auth
  failures, with retry).
- **Optimistic UI:** posted comments appear immediately in the activity feed;
  inline review comments are tracked as pending for the review session. Review
  and comment submission call the GitHub API (and return a no-op success in demo
  mode). Merge is intentionally read-only.
- **Syntax highlighting** is a deliberately small built-in tokenizer to keep the
  build dependency-free; Shiki/Prism is a drop-in upgrade behind the same API.
- Section configuration lives in an in-memory store for the session — there is
  no persistence layer, by design.

### Out of scope (per the brief)

GitHub App, webhooks, background jobs, merge queue, stacked-PR creation,
analytics, notifications, team dashboards, Slack/AI features, and any database.
Stack visualization is intentionally omitted (it depends on Graphite-specific
metadata GitHub doesn't expose).
