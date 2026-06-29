"use client";

import { Plus, X } from "lucide-react";
import type { PullRequest } from "@/types/pr";
import type {
  FilterCondition,
  FilterGroup,
  FilterOperator,
  FilterQuery,
} from "@/services/filters/types";
import { FIELD_DESCRIPTORS, descriptorFor } from "@/services/filters/types";
import { newCondition, newGroup } from "@/store/sections";
import { Button, Select, Input } from "@/components/ui/kit";

const OPERATOR_LABEL: Record<FilterOperator, string> = {
  is: "is",
  isNot: "is not",
  contains: "contains",
};

export function FilterBuilder({
  value,
  onChange,
  prs,
}: {
  value: FilterQuery;
  onChange: (q: FilterQuery) => void;
  prs: PullRequest[];
}) {
  const updateGroup = (gid: string, patch: Partial<FilterGroup>) =>
    onChange({
      groups: value.groups.map((g) => (g.id === gid ? { ...g, ...patch } : g)),
    });

  const updateCondition = (
    gid: string,
    cid: string,
    patch: Partial<FilterCondition>,
  ) =>
    onChange({
      groups: value.groups.map((g) =>
        g.id === gid
          ? {
              ...g,
              conditions: g.conditions.map((c) =>
                c.id === cid ? { ...c, ...patch } : c,
              ),
            }
          : g,
      ),
    });

  const addCondition = (gid: string) =>
    onChange({
      groups: value.groups.map((g) =>
        g.id === gid ? { ...g, conditions: [...g.conditions, newCondition()] } : g,
      ),
    });

  const removeCondition = (gid: string, cid: string) =>
    onChange({
      groups: value.groups
        .map((g) =>
          g.id === gid
            ? { ...g, conditions: g.conditions.filter((c) => c.id !== cid) }
            : g,
        )
        .filter((g) => g.conditions.length > 0),
    });

  const addGroup = () => onChange({ groups: [...value.groups, newGroup()] });
  const removeGroup = (gid: string) =>
    onChange({ groups: value.groups.filter((g) => g.id !== gid) });

  return (
    <div className="space-y-3">
      {value.groups.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
          No filters. This section will match every pull request.
        </p>
      )}

      {value.groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="rounded border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                And
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface-2/40 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex overflow-hidden rounded-md border border-border">
                {(["AND", "OR"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => updateGroup(group.id, { connector: c })}
                    className={
                      "px-2.5 py-1 text-[11px] font-semibold " +
                      (group.connector === c
                        ? "bg-primary text-primary-fg"
                        : "bg-surface text-muted hover:text-fg")
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => removeGroup(group.id)}
                className="rounded p-1 text-muted hover:bg-surface hover:text-danger"
                aria-label="Remove group"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {group.conditions.map((cond) => (
                <ConditionRow
                  key={cond.id}
                  cond={cond}
                  prs={prs}
                  onChange={(patch) =>
                    updateCondition(group.id, cond.id, patch)
                  }
                  onRemove={() => removeCondition(group.id, cond.id)}
                />
              ))}
            </div>

            <button
              onClick={() => addCondition(group.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add condition
            </button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addGroup}>
        <Plus className="h-3.5 w-3.5" />
        Add filter group
      </Button>
    </div>
  );
}

function ConditionRow({
  cond,
  prs,
  onChange,
  onRemove,
}: {
  cond: FilterCondition;
  prs: PullRequest[];
  onChange: (patch: Partial<FilterCondition>) => void;
  onRemove: () => void;
}) {
  const descriptor = descriptorFor(cond.field);
  const options = descriptor.options?.(prs) ?? [];

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={cond.field}
        className="h-8 flex-1 text-xs"
        onChange={(e) => {
          const next = descriptorFor(e.target.value as FilterCondition["field"]);
          onChange({
            field: next.field,
            operator: next.operators[0],
            value: "",
          });
        }}
      >
        {FIELD_DESCRIPTORS.map((d) => (
          <option key={d.field} value={d.field}>
            {d.label}
          </option>
        ))}
      </Select>

      <Select
        value={cond.operator}
        className="h-8 w-24 text-xs"
        onChange={(e) =>
          onChange({ operator: e.target.value as FilterOperator })
        }
      >
        {descriptor.operators.map((op) => (
          <option key={op} value={op}>
            {OPERATOR_LABEL[op]}
          </option>
        ))}
      </Select>

      {descriptor.input === "boolean" ? (
        <Select
          value={cond.value || "true"}
          className="h-8 w-24 text-xs"
          onChange={(e) => onChange({ value: e.target.value })}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </Select>
      ) : descriptor.input === "select" ? (
        <Select
          value={cond.value}
          className="h-8 flex-1 text-xs"
          onChange={(e) => onChange({ value: e.target.value })}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          {cond.value && !options.includes(cond.value) && (
            <option value={cond.value}>{cond.value}</option>
          )}
        </Select>
      ) : (
        <Input
          value={cond.value}
          placeholder="value"
          className="h-8 flex-1 text-xs"
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}

      <button
        onClick={onRemove}
        className="rounded p-1 text-muted hover:bg-surface hover:text-danger"
        aria-label="Remove condition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
