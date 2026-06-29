import type { PullRequest } from "@/types/pr";

export type ReviewBucket =
  | "waiting_for_review"
  | "waiting_for_author"
  | "approved"
  | "merged"
  | "draft";

/**
 * Derive a PR's review state from GitHub signals rather than hardcoding it.
 * Priority order matters: a CHANGES_REQUESTED PR is "waiting for author" even
 * if it still has reviewers requested.
 */
export function classifyPR(
  pr: PullRequest,
  viewerLogin?: string,
): ReviewBucket {
  if (pr.state === "MERGED") return "merged";
  if (pr.isDraft) return "draft";

  // Author must respond to requested changes.
  if (pr.reviewDecision === "CHANGES_REQUESTED") return "waiting_for_author";

  // Required approvals satisfied.
  if (pr.reviewDecision === "APPROVED") return "approved";

  // CI failing on your own PR is your move to make.
  if (viewerLogin && pr.author.login === viewerLogin && pr.ciStatus === "FAILURE") {
    return "waiting_for_author";
  }

  // Otherwise it is awaiting review.
  return "waiting_for_review";
}

/**
 * Whether a PR belongs in a built-in section. When a viewer is provided,
 * "waiting_for_review" is personalized to PRs awaiting *their* review.
 */
export function inBuiltinSection(
  pr: PullRequest,
  kind: Exclude<ReviewBucket, "merged" | "draft"> | "production",
  viewerLogin?: string,
): boolean {
  if (kind === "production") return false; // production uses a filter, handled elsewhere
  const bucket = classifyPR(pr, viewerLogin);
  if (bucket !== kind) return false;

  if (kind === "waiting_for_review" && viewerLogin) {
    const isRequested = pr.requestedReviewers.some((r) => r.login === viewerLogin);
    const hasReviewed = pr.reviewers.some((r) => r.user.login === viewerLogin);
    const isAuthor = pr.author.login === viewerLogin;
    // Awaiting *my* review, or unassigned PRs I could pick up (not my own).
    return isRequested || (!hasReviewed && !isAuthor);
  }
  return true;
}

export function bucketLabel(bucket: ReviewBucket): string {
  switch (bucket) {
    case "waiting_for_review":
      return "Waiting for review";
    case "waiting_for_author":
      return "Waiting for author";
    case "approved":
      return "Approved";
    case "merged":
      return "Merged";
    case "draft":
      return "Draft";
  }
}
