import { NextResponse } from "next/server";
import { getPullRequestDetail } from "@/services/github/pull-requests";
import { GitHubError } from "@/services/github/client";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> },
) {
  const { owner, repo, number } = await params;
  try {
    const detail = await getPullRequestDetail(owner, repo, Number(number));
    if (!detail) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(detail);
  } catch (e) {
    const err = e as GitHubError;
    return NextResponse.json(
      { error: err.message, type: err.type ?? "unknown" },
      { status: err.status ?? 500 },
    );
  }
}
