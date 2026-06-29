export interface User {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export type ReviewDecision =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REVIEW_REQUIRED"
  | "COMMENTED"
  | null;

export type CIStatus = "SUCCESS" | "FAILURE" | "PENDING" | "EXPECTED" | null;

export type MergeableState = "MERGEABLE" | "CONFLICTING" | "UNKNOWN";

export type PRState = "OPEN" | "CLOSED" | "MERGED";

export interface Reviewer {
  user: User;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "PENDING";
}

export interface Label {
  name: string;
  color: string; // hex without '#'
}

export interface CheckRun {
  name: string;
  status: CIStatus;
  detailsUrl?: string;
}

/** The normalized PR shape every screen reads from. */
export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: PRState;
  isDraft: boolean;
  url: string;
  repo: { owner: string; name: string; nameWithOwner: string };
  author: User;
  baseRefName: string;
  headRefName: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  reviewDecision: ReviewDecision;
  ciStatus: CIStatus;
  mergeable: MergeableState;
  labels: Label[];
  reviewers: Reviewer[];
  requestedReviewers: User[];
  updatedAt: string;
  createdAt: string;
  commentCount: number;
}

export interface PullRequestDetail extends PullRequest {
  body: string;
  bodyHtml?: string;
  checks: CheckRun[];
  timeline: TimelineEvent[];
  files: DiffFile[];
}

export interface TimelineEvent {
  id: string;
  type: "comment" | "review" | "commit" | "label" | "merged" | "review_request";
  actor: User;
  createdAt: string;
  body?: string;
  state?: string;
  detail?: string;
}

export interface DiffFile {
  path: string;
  previousPath?: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  patch: string; // unified diff
  comments?: InlineComment[];
}

export interface InlineComment {
  id: string;
  path: string;
  line: number;
  side: "LEFT" | "RIGHT";
  author: User;
  body: string;
  createdAt: string;
  pending?: boolean;
}
