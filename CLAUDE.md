# Lane — Project Context

A handoff summary of this chat: what was asked, what was built, the decisions
behind it, and how to run and deploy it.

---

## 1. What this is

**Lane** is a production-quality, limited-scope clone of the **Graphite pull
request review workflow**, built as a single **Next.js 15** app. It reproduces
four screens only and replicates the *workflow and UX* (not Graphite's
branding) with an original dark-first design.

The four screens:

1. **Inbox / Review Dashboard** — PRs grouped into sections, virtualized.
2. **Pull Request Overview** — description, reviews, checks, activity, merge status.
3. **Pull Request Review / Diff Viewer** — file tree, unified & side-by-side diffs, viewed tracking, inline + pending comments, review submission.
4. **Edit Section Drawer** — section name, repository scoping, AND/OR filter builder.

Design signature: dark mode primary, a violet accent (`#6E5BF2`), and a
monospace "data language" for PR numbers, branches, and diff stats.

---

## 2. The original brief (condensed)

- **Stack (required):** Next.js 15 App Router, React 19, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, React Virtuoso, Framer Motion, Auth.js (GitHub OAuth).
- **Architecture (required):** a *single* Next.js project. **No** separate backend, NestJS/Express, Postgres/Prisma, Redis, workers, queues, GitHub App, or webhooks. Use Route Handlers, Server Components, and Server Actions. Talk **directly to the GitHub API** (GraphQL preferred, REST fallback). **No database, no persistence** — derive all review states at runtime.
- **Auth:** GitHub OAuth login, logout, secure session, repository selection. No org/installation flow.
- **Filter system:** repository, author, reviewer, requested reviewer, review status, draft/open/closed/merged, labels, branch, CI status, mergeable, search text — extensible.
- **Review classification (derived, not hardcoded):** Waiting for Review, Waiting for Author, Approved, Production PRs.
- **GitHub client:** pagination, rate-limit handling, error handling, request deduplication, typed responses.
- **UI:** original design, dark (primary) + light, responsive, keyboard-friendly, smooth animations, loading skeletons, empty states, error states.
- **Performance:** RSC, Suspense, virtualized lists, lazy loading, memoization, smart caching, optimistic UI, respect rate limits.
- **Out of scope:** GitHub App, webhooks, background jobs, merge queue, stacked-PR creation, analytics, notifications, team dashboards, Slack/AI, any DB.

---

## 3. Key decisions

- **Product name:** "Lane."
- **Demo / mock mode (deliberate, not persistence).** The app boots with realistic static fixtures and **zero setup** — no GitHub app required. This honors the "no database" rule while letting every screen render fully. Demo mode is active whenever `AUTH_GITHUB_ID` is missing **or** `MOCK_DATA=true`. Adding OAuth credentials flips it to live GitHub automatically.
- **Tailwind v3.4** (not v4) for build reliability; shadcn primitives hand-rolled (a `cn` util + variant maps + Framer Motion) to keep installs lean and React-19-peer-safe.
- **System font stacks** (not `next/font/google`) so the build works offline.
- **Built-in lightweight syntax highlighter** (a small tokenizer) instead of Shiki/Prism, to keep the build dependency-free. It's a drop-in upgrade behind the same API.
- Dependencies installed with `--legacy-peer-deps` (React 19 vs libraries still declaring React 18 peers).

---

## 4. What was built

### Phase 1 — full scaffold + all four screens
- Project config (Next 15, strict TS, Tailwind tokens, PostCSS, env).
- **Data layer:** typed GitHub client (dedupe, cursor pagination, rate-limit tracking, retry/backoff, typed errors); GraphQL queries + REST fallback for unified diffs; PR mapping; mock fixtures; server-only data functions; Server Actions for review submission and comments.
- **Domain logic:** runtime review classification; an extensible filter field registry + AND/OR evaluation engine; per-section PR resolution + sorting.
- **State:** Zustand stores for sections and UI (theme / diff view / sort / repo scope); TanStack Query hooks; a unified-diff parser.
- **UI:** design-system primitives (button, badge, avatar, drawer, menu, inputs, skeletons, etc.); the app shell (logo, repo switcher, theme toggle, account menu); the **Inbox** (sidebar, grouped virtualized list, PR row with all required metadata, sort menu, empty/loading states); the **Edit Section drawer** + **filter builder**; the **PR Overview** (markdown description, reviews, checks, labels, activity timeline, merge status, comment composer, Finish-review + read-only Merge); the **Diff Viewer** (file tree with search, unified/split, collapsible files, viewed checkbox, inline + pending comments, review toolbar wired to GitHub).
- **Pages/routing:** root redirect, login (OAuth or demo entry), authenticated layout, inbox, PR overview, PR review.

### Phase 2 — closing production gaps (against the spec)
- **Error states:** a reusable `ErrorState` + `describeError` (rate-limit / auth-expiry / network / 404 → friendly copy); route-level `error.tsx`, top-level `global-error.tsx`, and a custom `not-found.tsx`; the inbox surfaces fetch errors with retry; the fetch hook parses typed error bodies.
- **Keyboard navigation** (`useKeyboardShortcuts` hook that ignores typing contexts):
  - **Inbox:** `j`/`k` move selection, `Enter`/`o` open, `/` search, `e` edit section, `r` refresh, `?` help.
  - **Diff viewer:** `j`/`k` between files, `v` toggle viewed, `u`/`s` switch view, `?` help.
  - A shared shortcuts overlay (`?`).
- **Responsive:** the inbox sidebar collapses to a mobile slide-over with a toggle; toolbar adapts.
- **Optimistic UI:** posted comments appear immediately in the activity feed.
- **Performance/polish:** lazy-loaded the edit drawer + shortcuts overlay via `next/dynamic`; `loading.tsx` skeletons for PR routes; `generateMetadata` so PR tabs read `#1480 · owner/repo`.
- **Inbox search:** a quick search box wired through the filter logic (title/repo/number/author/branch), affecting list + section counts.
- **Production auth fix:** set `trustHost: true` (fixes `UntrustedHost` on self-hosted/proxied deploys) and restructured the middleware so it **skips auth entirely in demo mode** and only guards routes when real OAuth is configured.

---

## 5. Spec coverage checklist

| Area | Status |
| --- | --- |
| Inbox: sections, counts, active state, collapse, settings, add section | ✅ |
| PR row: repo, #, title, author, reviewers, requested reviewers, review status, CI, mergeability, labels, +/−, files, updated | ✅ |
| Inbox: sorting, refresh, skeletons, empty states, search | ✅ |
| Diff viewer: file tree + search, unified, side-by-side, syntax highlighting, collapsible files, viewed, inline/existing/pending comments, review progress, toolbar | ✅ |
| Review actions: Approve / Comment / Request changes (call GitHub) | ✅ |
| Overview: title, description, author, branches, reviews, reviewers, checks, labels, discussion/activity, merge status, Finish-review, read-only Merge, composer | ✅ |
| Edit drawer: name, repo selector, filter builder, AND/OR, multiple groups, save/cancel/delete | ✅ |
| Filter system (all listed fields, extensible) | ✅ |
| Review classification (derived from GitHub) | ✅ |
| GitHub client: pagination, rate limits, errors, dedupe, typed | ✅ |
| UI: original design, dark+light, responsive, keyboard, animations, loading/empty/error | ✅ |
| Performance: RSC, Suspense, virtualization, lazy loading, memoization, caching, optimistic | ✅ |
| Auth: GitHub OAuth, logout, session, repo selection | ✅ |
| Stack visualization | ⛔ intentionally omitted (optional; needs Graphite-specific metadata GitHub doesn't expose) |

---

## 6. Project structure

```
app/
  (app)/                     authenticated shell + screens
    layout.tsx               fetches viewer + repos, renders AppShell
    error.tsx                route-level error boundary
    inbox/                   Inbox dashboard (RSC → client island)
    pr/[owner]/[repo]/[number]/         Overview (+ loading, metadata)
    pr/[owner]/[repo]/[number]/review/  Diff viewer (+ loading)
  api/                       Route Handlers (prs, pr detail, auth)
  actions/                   Server Actions (submit review, comment)
  login/                     GitHub sign-in / demo entry
  global-error.tsx, not-found.tsx
components/
  layout/  inbox/  drawer/  pr/  pr/diff/  ui/
lib/                         cn/format, diff parser, syntax highlighter
services/
  github/                    typed client, queries, REST fallbacks, mapping, mocks
  filters/                   field registry + evaluation engine
  review/                    runtime classification + section resolution
store/                       Zustand (sections, UI)
hooks/                       TanStack Query hooks, keyboard hook
types/                       shared PR domain types
```

**Reusable modules:** GitHub client, auth, review classification, filter
engine, PR mapping, diff rendering, UI components.

**Stack:** Next.js 15 · React 19 · TypeScript (strict) · Tailwind · TanStack
Query · Zustand · React Virtuoso · Framer Motion · Auth.js · lucide-react.

---

## 7. Running it

**Demo mode (zero setup):**
```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000 → /inbox
```

**Connect live GitHub:**
1. Create a GitHub OAuth app. Callback URL: `http://localhost:3000/api/auth/callback/github`.
2. In `.env.local`: set `AUTH_SECRET` (`npx auth secret`), `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and comment out `MOCK_DATA`.
3. Restart. Scopes requested: `repo`, `read:user`.

**Scripts:** `dev`, `build`, `start`, `lint`, `typecheck`.

**Keyboard:** press `?` on the inbox or diff viewer for the full list (see §4).

---

## 8. Deploying to production

Standard Next.js app (Vercel, Docker, Node host).

1. Set env vars on the host — **do not ship `.env.local`**:
   `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` (and `AUTH_TRUST_HOST=true` if not on Vercel — already enabled via config). Point the OAuth callback at your production domain.
2. `npm ci --legacy-peer-deps && npm run build && npm run start`.

With real credentials present, demo mode turns off automatically, every screen
reads live GitHub data, and the middleware protects all app routes.

---

## 9. Build status & honest scope

- **Typecheck:** clean (`tsc --noEmit`). **Production build:** passes. **Runtime smoke test:** all routes 200, custom 404 works, zero auth errors in demo mode.
- The only build output is a **benign next-auth/jose Edge-runtime warning** on a code path that doesn't run with default JWT sessions.
- **Demo mode** uses static read-only fixtures by design (keeps the no-DB guarantee). Section configuration lives in an in-memory store for the session — no persistence layer, by design.
- **Review/comment submission** calls the GitHub API and returns a no-op success in demo mode. **Merge** is intentionally read-only.
- **Syntax highlighting** is a small built-in tokenizer (Shiki/Prism is a drop-in upgrade).
- **Out of scope** (per brief): GitHub App, webhooks, background jobs, merge queue, stacked-PR creation, analytics, notifications, team dashboards, Slack/AI, any database. Stack visualization intentionally omitted.

---

## 10. Possible next steps

- Richer syntax highlighting (swap the tokenizer for Shiki/Prism).
- A lightweight "related PRs on the same base branch" panel as a stand-in for stack visualization.
- Persist section configuration (would require relaxing the no-persistence constraint).
- Deeper optimistic flows for review submission.
