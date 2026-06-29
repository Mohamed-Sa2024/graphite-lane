"use client";

import { useQuery } from "@tanstack/react-query";
import type { PullRequest, PullRequestDetail } from "@/types/pr";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let type = "unknown";
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string; type?: string };
      if (body.error) message = body.error;
      if (body.type) type = body.type;
    } catch {
      /* non-JSON error body */
    }
    const err = new Error(message) as Error & { type: string; status: number };
    err.type = type;
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export function useInboxPRs(initialData: PullRequest[]) {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: () => getJSON<PullRequest[]>("/api/prs"),
    initialData,
  });
}

export function usePRDetail(
  owner: string,
  repo: string,
  number: number,
  initialData: PullRequestDetail,
) {
  return useQuery({
    queryKey: ["pr", owner, repo, number],
    queryFn: () =>
      getJSON<PullRequestDetail>(`/api/pr/${owner}/${repo}/${number}`),
    initialData,
  });
}
