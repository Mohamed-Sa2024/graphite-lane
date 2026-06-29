/**
 * A tiny unified-diff parser. GitHub returns per-file `patch` strings in the
 * standard unified format; we turn them into structured hunks/lines so the
 * diff viewer can render unified or side-by-side without pulling in a library.
 */

export type DiffLineType = "context" | "add" | "del";

export interface DiffLine {
  type: DiffLineType;
  /** 1-based line number in the old file (null for added lines). */
  oldNumber: number | null;
  /** 1-based line number in the new file (null for removed lines). */
  newNumber: number | null;
  content: string;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
}

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/;

export function parsePatch(patch: string): DiffHunk[] {
  if (!patch) return [];
  const hunks: DiffHunk[] = [];
  let current: DiffHunk | null = null;
  let oldNo = 0;
  let newNo = 0;

  for (const raw of patch.split("\n")) {
    const match = raw.match(HUNK_RE);
    if (match) {
      oldNo = parseInt(match[1], 10);
      newNo = parseInt(match[3], 10);
      current = {
        header: match[5]?.trim() ?? "",
        oldStart: oldNo,
        newStart: newNo,
        lines: [],
      };
      hunks.push(current);
      continue;
    }
    if (!current) continue;

    const marker = raw[0];
    const content = raw.slice(1);
    if (marker === "+") {
      current.lines.push({
        type: "add",
        oldNumber: null,
        newNumber: newNo++,
        content,
      });
    } else if (marker === "-") {
      current.lines.push({
        type: "del",
        oldNumber: oldNo++,
        newNumber: null,
        content,
      });
    } else {
      // context line (leading space) or "\ No newline at end of file"
      if (raw.startsWith("\\")) continue;
      current.lines.push({
        type: "context",
        oldNumber: oldNo++,
        newNumber: newNo++,
        content,
      });
    }
  }
  return hunks;
}

/** Pair add/del lines for side-by-side rendering. */
export interface SplitRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

export function toSplitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "context") {
      rows.push({ left: line, right: line });
      i++;
      continue;
    }
    // Gather a run of deletions followed by additions and zip them.
    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (i < lines.length && lines[i].type === "del") dels.push(lines[i++]);
    while (i < lines.length && lines[i].type === "add") adds.push(lines[i++]);
    const max = Math.max(dels.length, adds.length);
    for (let j = 0; j < max; j++) {
      rows.push({ left: dels[j] ?? null, right: adds[j] ?? null });
    }
  }
  return rows;
}

export function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext)) return "js";
  if (["json"].includes(ext)) return "json";
  if (["css", "scss"].includes(ext)) return "css";
  if (["md", "markdown"].includes(ext)) return "md";
  if (["py"].includes(ext)) return "py";
  if (["go"].includes(ext)) return "go";
  if (["rs"].includes(ext)) return "rs";
  if (["html", "xml"].includes(ext)) return "html";
  return "txt";
}
