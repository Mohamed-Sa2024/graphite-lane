import type { PullRequest } from "@/types/pr";
import type { Section } from "@/store/sections";
import { inBuiltinSection } from "./classify";
import { matchesQuery } from "@/services/filters/engine";
import type { SortKey } from "@/store/ui";

/** Repo scoping: a PR passes if no scope is set, or its repo is in scope. */
function inRepoScope(pr: PullRequest, scope: string[]): boolean {
  if (!scope.length) return true;
  return scope.includes(pr.repo.nameWithOwner);
}

/**
 * Resolve the PRs that belong in a section. Built-in sections use the derived
 * review classification; production/custom sections use the filter engine.
 * Both honor the section's own repo list and the global repo scope.
 */
export function prsForSection(
  section: Section,
  prs: PullRequest[],
  viewerLogin?: string,
  globalScope: string[] = [],
): PullRequest[] {
  return prs.filter((pr) => {
    if (!inRepoScope(pr, globalScope)) return false;
    if (section.repos.length && !section.repos.includes(pr.repo.nameWithOwner))
      return false;

    switch (section.kind) {
      case "waiting_for_review":
      case "waiting_for_author":
      case "approved":
        return inBuiltinSection(pr, section.kind, viewerLogin);
      case "production":
      case "custom":
        return matchesQuery(section.filter, pr);
      default:
        return false;
    }
  });
}

export function sortPRs(prs: PullRequest[], key: SortKey): PullRequest[] {
  const copy = [...prs];
  switch (key) {
    case "updated":
      return copy.sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
      );
    case "created":
      return copy.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
    case "additions":
      return copy.sort(
        (a, b) => b.additions + b.deletions - (a.additions + a.deletions),
      );
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
}
