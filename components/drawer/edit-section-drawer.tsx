"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import type { PullRequest } from "@/types/pr";
import type { FilterQuery } from "@/services/filters/types";
import { useSections, newGroup, type Section } from "@/store/sections";
import { Drawer } from "@/components/ui/overlay";
import { Button, Input, Checkbox } from "@/components/ui/kit";
import { FilterBuilder } from "./filter-builder";

const BUILTIN_NOTE: Record<string, string> = {
  waiting_for_review:
    "This section is derived from GitHub review state: open PRs awaiting your review.",
  waiting_for_author:
    "Derived automatically: PRs where changes were requested or the author must act.",
  approved: "Derived automatically: PRs whose required reviews are approved.",
};

export function EditSectionDrawer({
  sectionId,
  prs,
  repos,
  onClose,
}: {
  sectionId: string | null;
  prs: PullRequest[];
  repos: string[];
  onClose: () => void;
}) {
  const sections = useSections((s) => s.sections);
  const updateSection = useSections((s) => s.updateSection);
  const removeSection = useSections((s) => s.removeSection);

  const section = sections.find((s) => s.id === sectionId) ?? null;

  const [name, setName] = React.useState("");
  const [repoSel, setRepoSel] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState<FilterQuery>({ groups: [] });

  // Sync local draft whenever a different section opens.
  React.useEffect(() => {
    if (section) {
      setName(section.name);
      setRepoSel(section.repos);
      setFilter(
        section.filter.groups.length
          ? section.filter
          : { groups: [newGroup()] },
      );
    }
  }, [section?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const usesFilter =
    section?.kind === "production" || section?.kind === "custom";
  const canDelete = usesFilter;

  const save = () => {
    if (!section) return;
    const patch: Partial<Section> = { name: name.trim() || "Untitled", repos: repoSel };
    if (usesFilter) patch.filter = filter;
    updateSection(section.id, patch);
    onClose();
  };

  const del = () => {
    if (section) removeSection(section.id);
    onClose();
  };

  const allRepos = Array.from(new Set([...repos, ...repoSel])).sort();

  return (
    <Drawer
      open={!!section}
      onClose={onClose}
      title="Edit section"
      description={section ? section.name : undefined}
      footer={
        <div className="flex items-center justify-between">
          {canDelete ? (
            <Button variant="ghost" size="sm" onClick={del} className="text-danger">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      {!section ? null : (
        <div className="space-y-5">
          <Field label="Section name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Needs my review"
            />
          </Field>

          <Field
            label="Repositories"
            hint="Scope this section to specific repositories. Leave all unchecked to include every repo."
          >
            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-border bg-surface-2/40 p-2.5">
              {allRepos.length === 0 && (
                <p className="text-xs text-muted">No repositories available.</p>
              )}
              {allRepos.map((repo) => (
                <Checkbox
                  key={repo}
                  checked={repoSel.includes(repo)}
                  onChange={(on) =>
                    setRepoSel((prev) =>
                      on ? [...prev, repo] : prev.filter((r) => r !== repo),
                    )
                  }
                  label={<span className="font-mono text-xs">{repo}</span>}
                />
              ))}
            </div>
          </Field>

          <Field label="Filters">
            {usesFilter ? (
              <FilterBuilder value={filter} onChange={setFilter} prs={prs} />
            ) : (
              <p className="rounded-md border border-border bg-surface-2/40 px-3 py-2.5 text-xs leading-relaxed text-muted">
                {BUILTIN_NOTE[section.kind] ??
                  "This section is managed automatically."}
              </p>
            )}
          </Field>
        </div>
      )}
    </Drawer>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-fg">{label}</label>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}
