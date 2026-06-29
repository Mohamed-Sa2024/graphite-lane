import { notFound } from "next/navigation";
import { DiffViewer } from "@/components/pr/diff/diff-viewer";
import {
  getPullRequestDetail,
  getViewer,
} from "@/services/github/pull-requests";

export const dynamic = "force-dynamic";

export default async function PRReviewPage({
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

  return <DiffViewer detail={detail} viewer={viewer} />;
}
