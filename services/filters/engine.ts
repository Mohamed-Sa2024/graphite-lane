import type { PullRequest } from "@/types/pr";
import type {
  FilterCondition,
  FilterGroup,
  FilterQuery,
} from "./types";

/** Extract the comparable string value(s) for a field from a PR. */
function valuesFor(field: FilterCondition["field"], pr: PullRequest): string[] {
  switch (field) {
    case "repository":
      return [pr.repo.nameWithOwner];
    case "author":
      return [pr.author.login];
    case "reviewer":
      return pr.reviewers.map((r) => r.user.login);
    case "requestedReviewer":
      return pr.requestedReviewers.map((r) => r.login);
    case "reviewStatus":
      return [pr.reviewDecision ?? "REVIEW_REQUIRED"];
    case "state":
      return [pr.state];
    case "draft":
      return [String(pr.isDraft)];
    case "label":
      return pr.labels.map((l) => l.name);
    case "baseBranch":
      return [pr.baseRefName];
    case "ciStatus":
      return [pr.ciStatus ?? "PENDING"];
    case "mergeable":
      return [pr.mergeable];
    case "text":
      return [pr.title];
    default:
      return [];
  }
}

function evalCondition(cond: FilterCondition, pr: PullRequest): boolean {
  const values = valuesFor(cond.field, pr).map((v) => v.toLowerCase());
  const target = cond.value.toLowerCase();
  if (!cond.value) return true; // empty condition is a no-op

  switch (cond.operator) {
    case "is":
      return values.includes(target);
    case "isNot":
      return !values.includes(target);
    case "contains":
      return values.some((v) => v.includes(target));
    default:
      return true;
  }
}

function evalGroup(group: FilterGroup, pr: PullRequest): boolean {
  const active = group.conditions.filter((c) => c.value !== "");
  if (active.length === 0) return true;
  return group.connector === "AND"
    ? active.every((c) => evalCondition(c, pr))
    : active.some((c) => evalCondition(c, pr));
}

/** Outer connector across groups is always AND. */
export function matchesQuery(query: FilterQuery, pr: PullRequest): boolean {
  if (!query.groups.length) return true;
  return query.groups.every((g) => evalGroup(g, pr));
}

export function applyFilter(
  query: FilterQuery,
  prs: PullRequest[],
): PullRequest[] {
  return prs.filter((pr) => matchesQuery(query, pr));
}
