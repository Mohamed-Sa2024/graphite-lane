import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Overview } from "@/components/pr/overview";
import {
  getPullRequestDetail,
  getViewer,
} from "@/services/github/pull-requests";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string }>;
}): Promise<Metadata> {
  const { owner, repo, number } = await params;
  return { title: `#${number} · ${owner}/${repo} — Lane` };
}

export default async function PROverviewPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string }>;
}) {
  const { owner, repo, number } = await params;
  const prNumber = Number(number);
  if (!Number.isFinite(prNumber)) notFound();

  const [detail, viewer] = await Promise.all([
    getPullRequestDetail(owner, repo, prNumber),
    getViewer(),
  ]);

  if (!detail) notFound();

  return <Overview detail={detail} viewer={viewer} />;
}
