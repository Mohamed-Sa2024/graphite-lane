import type { PullRequest } from "@/types/pr";

/** A single filter field. The system is extended by adding entries here. */
export type FilterField =
  | "repository"
  | "author"
  | "reviewer"
  | "requestedReviewer"
  | "reviewStatus"
  | "state"
  | "draft"
  | "label"
  | "baseBranch"
  | "ciStatus"
  | "mergeable"
  | "text";

export type FilterOperator = "is" | "isNot" | "contains";

export interface FilterCondition {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

/** Conditions within a group are combined with the group's connector. */
export interface FilterGroup {
  id: string;
  connector: "AND" | "OR";
  conditions: FilterCondition[];
}

/** Groups are always combined with AND (the outer connector). */
export interface FilterQuery {
  groups: FilterGroup[];
}

export interface FieldDescriptor {
  field: FilterField;
  label: string;
  operators: FilterOperator[];
  /** "select" derives options from the loaded PRs, "text" is free input. */
  input: "text" | "select" | "boolean";
  options?: (prs: PullRequest[]) => string[];
}

export const FIELD_DESCRIPTORS: FieldDescriptor[] = [
  {
    field: "repository",
    label: "Repository",
    operators: ["is", "isNot"],
    input: "select",
    options: (prs) => unique(prs.map((p) => p.repo.nameWithOwner)),
  },
  {
    field: "author",
    label: "Author",
    operators: ["is", "isNot"],
    input: "select",
    options: (prs) => unique(prs.map((p) => p.author.login)),
  },
  {
    field: "reviewer",
    label: "Reviewer",
    operators: ["is", "isNot"],
    input: "select",
    options: (prs) => unique(prs.flatMap((p) => p.reviewers.map((r) => r.user.login))),
  },
  {
    field: "requestedReviewer",
    label: "Requested reviewer",
    operators: ["is", "isNot"],
    input: "select",
    options: (prs) => unique(prs.flatMap((p) => p.requestedReviewers.map((r) => r.login))),
  },
  {
    field: "reviewStatus",
    label: "Review status",
    operators: ["is", "isNot"],
    input: "select",
    options: () => ["APPROVED", "CHANGES_REQUESTED", "REVIEW_REQUIRED", "COMMENTED"],
  },
  {
    field: "state",
    label: "State",
    operators: ["is", "isNot"],
    input: "select",
    options: () => ["OPEN", "CLOSED", "MERGED"],
  },
  {
    field: "draft",
    label: "Draft",
    operators: ["is"],
    input: "boolean",
  },
  {
    field: "label",
    label: "Label",
    operators: ["is", "isNot", "contains"],
    input: "select",
    options: (prs) => unique(prs.flatMap((p) => p.labels.map((l) => l.name))),
  },
  {
    field: "baseBranch",
    label: "Base branch",
    operators: ["is", "isNot", "contains"],
    input: "select",
    options: (prs) => unique(prs.map((p) => p.baseRefName)),
  },
  {
    field: "ciStatus",
    label: "CI status",
    operators: ["is", "isNot"],
    input: "select",
    options: () => ["SUCCESS", "FAILURE", "PENDING"],
  },
  {
    field: "mergeable",
    label: "Mergeable",
    operators: ["is"],
    input: "select",
    options: () => ["MERGEABLE", "CONFLICTING", "UNKNOWN"],
  },
  {
    field: "text",
    label: "Title contains",
    operators: ["contains"],
    input: "text",
  },
];

export function descriptorFor(field: FilterField): FieldDescriptor {
  return FIELD_DESCRIPTORS.find((d) => d.field === field) ?? FIELD_DESCRIPTORS[0];
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}
