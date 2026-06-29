"use server";

import { isMockMode } from "@/lib/env";
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

/** Submit a PR review (Approve / Request changes / Comment). */
export async function submitReview(
  input: ReviewActionInput,
): Promise<ActionResult> {
  const { owner, repo, number, event, body } = input;
  if (event !== "COMMENT" && event !== "APPROVE" && !body.trim() && event === "REQUEST_CHANGES") {
    return { ok: false, message: "A comment is required when requesting changes." };
  }

  if (isMockMode) {
    return { ok: true, message: `Review submitted (${event}) — mock mode.` };
  }

  const client = await getClient();
  if (!client) return { ok: false, message: "Not authenticated with GitHub." };

  try {
    await client.rest(`/repos/${owner}/${repo}/pulls/${number}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, body: body || undefined }),
    });
    revalidatePath(`/pr/${owner}/${repo}/${number}`);
    return { ok: true, message: "Review submitted." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
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
    return { ok: false, message: (e as Error).message };
  }
}
