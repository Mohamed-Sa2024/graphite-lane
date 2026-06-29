import { AppShell } from "@/components/layout/app-shell";
import { getViewer, getRepos } from "@/services/github/pull-requests";
import { isMockMode } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewer, repos] = await Promise.all([getViewer(), getRepos()]);

  return (
    <AppShell viewer={viewer} repos={repos} mock={isMockMode}>
      {children}
    </AppShell>
  );
}
