import { Suspense } from "react";
import { Inbox } from "@/components/inbox/inbox";
import { InboxSkeleton } from "@/components/inbox/skeletons";
import {
  getInboxPullRequests,
  getViewer,
  getRepos,
} from "@/services/github/pull-requests";

export const dynamic = "force-dynamic";

async function InboxData() {
  const [prs, viewer, repos] = await Promise.all([
    getInboxPullRequests(),
    getViewer(),
    getRepos(),
  ]);

  return (
    <Inbox initialPRs={prs} viewerLogin={viewer.login} repos={repos} />
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxSkeleton />}>
      <InboxData />
    </Suspense>
  );
}
