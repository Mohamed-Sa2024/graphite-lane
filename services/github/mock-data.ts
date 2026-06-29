import type {
  CheckRun,
  DiffFile,
  PullRequest,
  PullRequestDetail,
  TimelineEvent,
  User,
} from "@/types/pr";

const u = (login: string, name: string): User => ({
  login,
  name,
  avatarUrl: `https://avatars.githubusercontent.com/${login}?size=64`,
});

export const MOCK_VIEWER = u("you", "You");

const people = {
  you: MOCK_VIEWER,
  rivera: u("rivera", "Ana Rivera"),
  okafor: u("okafor", "Tunde Okafor"),
  lin: u("lin", "Mei Lin"),
  patel: u("patel", "Dev Patel"),
  schmidt: u("schmidt", "Lena Schmidt"),
};

let n = 1480;
const id = () => `PR_${n}`;

function pr(p: Omit<Partial<PullRequest>, "repo" | "author"> & {
  title: string;
  repo: string;
  author: User;
}): PullRequest {
  const [owner, name] = p.repo.split("/");
  const number = p.number ?? n++;
  return {
    id: id(),
    number,
    title: p.title,
    state: p.state ?? "OPEN",
    isDraft: p.isDraft ?? false,
    url: `https://github.com/${p.repo}/pull/${number}`,
    repo: { owner, name, nameWithOwner: p.repo },
    author: p.author,
    baseRefName: p.baseRefName ?? "main",
    headRefName: p.headRefName ?? "feature/branch",
    additions: p.additions ?? 0,
    deletions: p.deletions ?? 0,
    changedFiles: p.changedFiles ?? 1,
    reviewDecision: p.reviewDecision ?? null,
    ciStatus: p.ciStatus ?? "SUCCESS",
    mergeable: p.mergeable ?? "MERGEABLE",
    labels: p.labels ?? [],
    reviewers: p.reviewers ?? [],
    requestedReviewers: p.requestedReviewers ?? [],
    updatedAt: p.updatedAt ?? new Date(Date.now() - 3600_000).toISOString(),
    createdAt: p.createdAt ?? new Date(Date.now() - 86400_000).toISOString(),
    commentCount: p.commentCount ?? 0,
  };
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const MOCK_PRS: PullRequest[] = [
  pr({
    title: "Add request deduplication to the GitHub client",
    repo: "acme/lane",
    author: people.rivera,
    headRefName: "ana/dedupe-client",
    additions: 184,
    deletions: 32,
    changedFiles: 6,
    requestedReviewers: [people.you, people.lin],
    ciStatus: "SUCCESS",
    labels: [{ name: "infra", color: "6E5BF2" }],
    updatedAt: hoursAgo(1),
    commentCount: 2,
  }),
  pr({
    title: "Fix flaky pagination test on slow connections",
    repo: "acme/lane",
    author: people.okafor,
    headRefName: "tunde/flaky-pagination",
    additions: 41,
    deletions: 12,
    changedFiles: 2,
    requestedReviewers: [people.you],
    ciStatus: "PENDING",
    labels: [{ name: "tests", color: "2FBF71" }],
    updatedAt: hoursAgo(3),
  }),
  pr({
    title: "Introduce dark mode tokens and theme toggle",
    repo: "acme/lane",
    author: people.patel,
    headRefName: "dev/theme-tokens",
    additions: 268,
    deletions: 90,
    changedFiles: 11,
    reviewers: [{ user: people.you, state: "COMMENTED" }],
    requestedReviewers: [people.schmidt],
    ciStatus: "SUCCESS",
    labels: [{ name: "design", color: "E8A53D" }],
    updatedAt: hoursAgo(5),
    commentCount: 4,
  }),
  pr({
    title: "Refactor diff parser to handle renamed files",
    repo: "acme/web",
    author: people.you,
    headRefName: "you/rename-diffs",
    additions: 96,
    deletions: 140,
    changedFiles: 4,
    reviewDecision: "CHANGES_REQUESTED",
    reviewers: [{ user: people.lin, state: "CHANGES_REQUESTED" }],
    ciStatus: "FAILURE",
    mergeable: "CONFLICTING",
    labels: [{ name: "needs-work", color: "E5484D" }],
    updatedAt: hoursAgo(2),
    commentCount: 7,
  }),
  pr({
    title: "Document the filter engine and section model",
    repo: "acme/web",
    author: people.you,
    headRefName: "you/filter-docs",
    additions: 312,
    deletions: 4,
    changedFiles: 3,
    reviewDecision: "CHANGES_REQUESTED",
    reviewers: [{ user: people.rivera, state: "CHANGES_REQUESTED" }],
    ciStatus: "SUCCESS",
    labels: [{ name: "docs", color: "4C8DFF" }],
    updatedAt: hoursAgo(8),
    commentCount: 3,
  }),
  pr({
    title: "Cache viewer query for the session",
    repo: "acme/lane",
    author: people.schmidt,
    headRefName: "lena/cache-viewer",
    additions: 58,
    deletions: 10,
    changedFiles: 2,
    reviewDecision: "APPROVED",
    reviewers: [
      { user: people.you, state: "APPROVED" },
      { user: people.rivera, state: "APPROVED" },
    ],
    ciStatus: "SUCCESS",
    labels: [{ name: "infra", color: "6E5BF2" }],
    updatedAt: hoursAgo(6),
  }),
  pr({
    title: "Add keyboard shortcuts to the inbox",
    repo: "acme/web",
    author: people.okafor,
    headRefName: "tunde/keyboard-shortcuts",
    additions: 130,
    deletions: 18,
    changedFiles: 5,
    reviewDecision: "APPROVED",
    reviewers: [{ user: people.you, state: "APPROVED" }],
    ciStatus: "SUCCESS",
    labels: [{ name: "a11y", color: "2FBF71" }],
    updatedAt: hoursAgo(10),
  }),
  pr({
    title: "Release: cut v0.4.0 to production",
    repo: "acme/lane",
    author: people.rivera,
    baseRefName: "main",
    headRefName: "release/v0.4.0",
    additions: 12,
    deletions: 2,
    changedFiles: 1,
    reviewDecision: "APPROVED",
    reviewers: [{ user: people.you, state: "APPROVED" }],
    ciStatus: "SUCCESS",
    labels: [{ name: "production", color: "111827" }],
    updatedAt: hoursAgo(1),
  }),
  pr({
    title: "WIP: experiment with side-by-side virtualization",
    repo: "acme/web",
    author: people.patel,
    headRefName: "dev/virtual-sxs",
    isDraft: true,
    additions: 220,
    deletions: 60,
    changedFiles: 8,
    ciStatus: "PENDING",
    updatedAt: hoursAgo(20),
  }),
  pr({
    title: "Bump framer-motion and fix reduced-motion fallback",
    repo: "acme/design-system",
    author: people.lin,
    headRefName: "mei/bump-motion",
    additions: 24,
    deletions: 24,
    changedFiles: 3,
    requestedReviewers: [people.you],
    ciStatus: "SUCCESS",
    labels: [{ name: "deps", color: "8B90A0" }],
    updatedAt: hoursAgo(4),
  }),
];

export const MOCK_REPOS = [
  "acme/lane",
  "acme/web",
  "acme/design-system",
  "acme/infra",
];

const SAMPLE_FILES: DiffFile[] = [
  {
    path: "services/github/client.ts",
    status: "modified",
    additions: 22,
    deletions: 4,
    patch: `@@ -12,6 +12,9 @@ export function createGitHubClient(token: string) {
   const inflight = new Map<string, Promise<unknown>>();
   const state = { remaining: null, resetAt: null };
 
+  function dedupe(key, fn) {
+    const existing = inflight.get(key);
+    if (existing) return existing;
+  }
   const baseHeaders = {
     Authorization: \`Bearer \${token}\`,
-    Accept: "application/json",
+    Accept: "application/vnd.github+json",
+    "X-GitHub-Api-Version": "2022-11-28",
   };
@@ -40,7 +43,7 @@ export function createGitHubClient(token: string) {
     const res = await fetch(url, init);
-    return res.json();
+    if (!res.ok) throw new GitHubError("request failed", "unknown", res.status);
+    return res.json();
   }`,
    comments: [
      {
        id: "c1",
        path: "services/github/client.ts",
        line: 16,
        side: "RIGHT",
        author: people.lin,
        body: "Can we add the in-flight delete in a `finally` so failed requests don't pin the cache?",
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    path: "components/inbox/pr-row.tsx",
    status: "added",
    additions: 48,
    deletions: 0,
    patch: `@@ -0,0 +1,12 @@
+export function PrRow({ pr }: { pr: PullRequest }) {
+  return (
+    <div className="flex items-center gap-3">
+      <StatusDot status={pr.ciStatus} />
+      <span className="font-mono text-xs">#{pr.number}</span>
+      <span className="truncate">{pr.title}</span>
+      <DiffStat add={pr.additions} del={pr.deletions} />
+    </div>
+  );
+}`,
  },
  {
    path: "README.md",
    status: "modified",
    additions: 6,
    deletions: 1,
    patch: `@@ -1,4 +1,9 @@
-# Lane
+# Lane — a PR review inbox
+
+Triage pull requests across repositories, review diffs, and act
+without leaving the keyboard.
 
-A small project.
+## Getting started
+Run \`npm run dev\` and open http://localhost:3000.`,
  },
];

function timeline(author: User): TimelineEvent[] {
  return [
    {
      id: "t1",
      type: "commit",
      actor: author,
      createdAt: hoursAgo(9),
      detail: "pushed 3 commits",
    },
    {
      id: "t2",
      type: "review_request",
      actor: people.rivera,
      createdAt: hoursAgo(8),
      detail: "requested a review from you",
    },
    {
      id: "t3",
      type: "comment",
      actor: people.lin,
      createdAt: hoursAgo(3),
      body: "Looks close. Left one note on the client cache — otherwise this is great.",
    },
  ];
}

const CHECKS: CheckRun[] = [
  { name: "build", status: "SUCCESS" },
  { name: "unit-tests", status: "SUCCESS" },
  { name: "typecheck", status: "SUCCESS" },
  { name: "e2e", status: "PENDING" },
];

export function mockDetail(
  owner: string,
  repo: string,
  number: number,
): PullRequestDetail {
  const base =
    MOCK_PRS.find(
      (p) => p.repo.nameWithOwner === `${owner}/${repo}` && p.number === number,
    ) ?? MOCK_PRS[0];

  return {
    ...base,
    body: `### Summary\n\nThis change ${base.title.toLowerCase()}.\n\n- Adds request deduplication keyed by query + variables\n- Surfaces rate-limit state on the client\n- Covered by new unit tests\n\n### Testing\n\n\`npm run test\` — all green locally.`,
    checks: CHECKS,
    timeline: timeline(base.author),
    files: SAMPLE_FILES,
  };
}
