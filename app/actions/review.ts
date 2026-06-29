"use server";

import { isMockMode } from "@/lib/env";
import { getViewer, getPullRequestDetail } from "@/services/github/pull-requests";
import { getClient } from "@/services/github/server";
import { revalidatePath } from "next/cache";

export type ReviewEvent = "APPROVE" | "REQUEST_CHANGES" | "COMMENT";

export interface ReviewActionInput {
  owner: string;
  repo: string;
  number: number;
  event: ReviewEvent;
  body: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

function formatGitHubError(e: unknown): string {
  const msg = (e as Error).message;
  const jsonStart = msg.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(msg.slice(jsonStart)) as {
        message?: string;
        errors?: Array<string | { message?: string }>;
      };
      if (parsed.errors?.length) {
        return parsed.errors
          .map((err) => (typeof err === "string" ? err : err.message ?? String(err)))
          .join(" ");
      }
      if (parsed.message && parsed.message !== "Unprocessable Entity") {
        return parsed.message;
      }
    } catch {
      // fall through
    }
  }
  if (msg.toLowerCase().includes("approve your own")) {
    return "You can't approve your own pull request.";
  }
  return msg;
}

/** Submit a PR review (Approve / Request changes / Comment). */
export async function submitReview(
  input: ReviewActionInput,
): Promise<ActionResult> {
  const { owner, repo, number, event, body } = input;
  if (event === "REQUEST_CHANGES" && !body.trim()) {
    return { ok: false, message: "A comment is required when requesting changes." };
  }

  if (isMockMode) {
    return { ok: true, message: `Review submitted (${event}) — mock mode.` };
  }

  const client = await getClient();
  if (!client) return { ok: false, message: "Not authenticated with GitHub." };

  if (event !== "COMMENT") {
    const [viewer, detail] = await Promise.all([
      getViewer(),
      getPullRequestDetail(owner, repo, number),
    ]);
    if (detail && viewer.login === detail.author.login) {
      return {
        ok: false,
        message:
          event === "APPROVE"
            ? "You can't approve your own pull request."
            : "You can't request changes on your own pull request.",
      };
    }
  }

  try {
    await client.rest(`/repos/${owner}/${repo}/pulls/${number}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, body: body || undefined }),
    });
    revalidatePath(`/pr/${owner}/${repo}/${number}`);
    return { ok: true, message: "Review submitted." };
  } catch (e) {
    return { ok: false, message: formatGitHubError(e) };
  }
}

/** Add a top-level discussion comment. */
export async function addComment(input: {
  owner: string;
  repo: string;
  number: number;
  body: string;
}): Promise<ActionResult> {
  if (!input.body.trim()) return { ok: false, message: "Comment is empty." };
  if (isMockMode) return { ok: true, message: "Comment posted — mock mode." };

  const client = await getClient();
  if (!client) return { ok: false, message: "Not authenticated with GitHub." };
  try {
    await client.rest(
      `/repos/${input.owner}/${input.repo}/issues/${input.number}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: input.body }),
      },
    );
    revalidatePath(`/pr/${input.owner}/${input.repo}/${input.number}`);
    return { ok: true, message: "Comment posted." };
  } catch (e) {
    return { ok: false, message: formatGitHubError(e) };
  }
}
