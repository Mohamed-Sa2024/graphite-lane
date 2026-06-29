import { NextResponse } from "next/server";
import { getInboxPullRequests } from "@/services/github/pull-requests";
import { GitHubError } from "@/services/github/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prs = await getInboxPullRequests();
    return NextResponse.json(prs);
  } catch (e) {
    const err = e as GitHubError;
    return NextResponse.json(
      { error: err.message, type: err.type ?? "unknown" },
      { status: err.status ?? 500 },
    );
  }
}
