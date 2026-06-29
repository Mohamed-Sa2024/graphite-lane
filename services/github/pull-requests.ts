import "server-only";
import { isMockMode } from "@/lib/env";
import type {
  CheckRun,
  CIStatus,
  DiffFile,
  Label,
  MergeableState,
  PRState,
  PullRequest,
  PullRequestDetail,
  Reviewer,
  ReviewDecision,
  TimelineEvent,
  User,
} from "@/types/pr";
import { getClient } from "./server";
import {
  MOCK_PRS,
  MOCK_REPOS,
  MOCK_VIEWER,
  mockDetail,
} from "./mock-data";
import { PR_DETAIL, REPOS, SEARCH_PRS, VIEWER } from "./queries";

/* ---------------------------------- mapping --------------------------------- */

function mapActor(a: any): User {
  return {
    login: a?.login ?? "ghost",
    name: a?.name ?? null,
    avatarUrl: a?.avatarUrl ?? "",
  };
}

function mapCI(state?: string | null): CIStatus {
  switch (state) {
    case "SUCCESS":
      return "SUCCESS";
    case "FAILURE":
    case "ERROR":
      return "FAILURE";
    case "PENDING":
      return "PENDING";
    case "EXPECTED":
      return "EXPECTED";
    default:
      return null;
  }
}

function mapReviewers(reviewNodes: any[]): Reviewer[] {
  const byLogin = new Map<string, Reviewer>();
  for (const r of reviewNodes ?? []) {
    if (!r?.author?.login) continue;
    if (r.state === "DISMISSED" || r.state === "PENDING") continue;
    byLogin.set(r.author.login, {
      user: mapActor(r.author),
      state: r.state,
    });
  }
  return Array.from(byLogin.values());
}

export function mapPR(node: any): PullRequest {
  const rollup =
    node?.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state ?? null;
  const requested: User[] = (node?.reviewRequests?.nodes ?? [])
    .map((n: any) => n.requestedReviewer)
    .filter((r: any) => r?.__typename === "User")
    .map(mapActor);

  return {
    id: node.id,
    number: node.number,
    title: node.title,
    state: node.state as PRState,
    isDraft: node.isDraft,
    url: node.url,
    repo: {
      owner: node.repository.owner.login,
      name: node.repository.name,
      nameWithOwner: node.repository.nameWithOwner,
    },
    author: mapActor(node.author),
    baseRefName: node.baseRefName,
    headRefName: node.headRefName,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
    reviewDecision: (node.reviewDecision ?? null) as ReviewDecision,
    ciStatus: mapCI(rollup),
    mergeable: (node.mergeable ?? "UNKNOWN") as MergeableState,
    labels: (node.labels?.nodes ?? []).map(
      (l: any): Label => ({ name: l.name, color: l.color }),
    ),
    reviewers: mapReviewers(node.reviews?.nodes),
    requestedReviewers: requested,
    updatedAt: node.updatedAt,
    createdAt: node.createdAt,
    commentCount: node.comments?.totalCount ?? 0,
  };
}

/* --------------------------------- fetchers --------------------------------- */

export async function getViewer(): Promise<User> {
  if (isMockMode) return MOCK_VIEWER;
  const client = await getClient();
  if (!client) return MOCK_VIEWER;
  const data = await client.graphql<{ viewer: any }>(VIEWER);
  return mapActor(data.viewer);
}

export async function getRepos(): Promise<string[]> {
  if (isMockMode) return MOCK_REPOS;
  const client = await getClient();
  if (!client) return MOCK_REPOS;
  const nodes = await client.paginate<{ nameWithOwner: string }>(
    REPOS,
    {},
    (d) => ({
      nodes: d.viewer.repositories.nodes,
      pageInfo: d.viewer.repositories.pageInfo,
    }),
    100,
  );
  return nodes.map((r) => r.nameWithOwner);
}

/**
 * Search PRs with a GitHub search query string, e.g.
 * "is:open is:pr involves:@me" scoped to selected repos.
 */
export async function searchPullRequests(
  query: string,
): Promise<PullRequest[]> {
  if (isMockMode) return MOCK_PRS;
  const client = await getClient();
  if (!client) return MOCK_PRS;
  const nodes = await client.paginate<any>(
    SEARCH_PRS,
    { q: query },
    (d) => ({
      nodes: (d.search.nodes ?? []).filter(
        (x: any) => x.__typename === "PullRequest",
      ),
      pageInfo: d.search.pageInfo,
    }),
    150,
  );
  return nodes.map(mapPR);
}

/** PRs that involve the viewer across all their repos. */
export async function getInboxPullRequests(): Promise<PullRequest[]> {
  return searchPullRequests("is:pr is:open involves:@me archived:false sort:updated-desc");
}

function mapChecks(node: any): CheckRun[] {
  const contexts =
    node?.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes ?? [];
  return contexts.map((c: any): CheckRun => {
    if (c.__typename === "CheckRun") {
      return {
        name: c.name,
        status: mapCI(c.conclusion ?? "PENDING"),
        detailsUrl: c.detailsUrl,
      };
    }
    return {
      name: c.context,
      status: mapCI(c.state),
      detailsUrl: c.targetUrl,
    };
  });
}

function mapTimeline(commentNodes: any[]): TimelineEvent[] {
  return (commentNodes ?? []).map(
    (c: any): TimelineEvent => ({
      id: c.id,
      type: "comment",
      actor: mapActor(c.author),
      createdAt: c.createdAt,
      body: c.body,
    }),
  );
}

export async function getPullRequestDetail(
  owner: string,
  repo: string,
  number: number,
): Promise<PullRequestDetail | null> {
  if (isMockMode) return mockDetail(owner, repo, number);
  const client = await getClient();
  if (!client) return mockDetail(owner, repo, number);

  const data = await client.graphql<{ repository: { pullRequest: any } }>(
    PR_DETAIL,
    { owner, repo, number },
  );
  const node = data.repository?.pullRequest;
  if (!node) return null;

  // Patches come from REST; GraphQL does not expose unified diffs.
  let files: DiffFile[] = [];
  try {
    const restFiles = await client.rest<any[]>(
      `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`,
    );
    files = restFiles.map(
      (f): DiffFile => ({
        path: f.filename,
        previousPath: f.previous_filename,
        status:
          f.status === "renamed"
            ? "renamed"
            : f.status === "added"
              ? "added"
              : f.status === "removed"
                ? "removed"
                : "modified",
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch ?? "",
      }),
    );
  } catch {
    files = [];
  }

  return {
    ...mapPR(node),
    body: node.body ?? "",
    bodyHtml: node.bodyHTML,
    checks: mapChecks(node),
    timeline: mapTimeline(node.comments?.nodes),
    files,
  };
}
