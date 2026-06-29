"use client";

import { Virtuoso } from "react-virtuoso";
import type { PullRequest } from "@/types/pr";
import { PRRow } from "./pr-row";

export function PRList({ prs }: { prs: PullRequest[] }) {
  return (
    <Virtuoso
      data={prs}
      className="h-full"
      computeItemKey={(_, pr) => pr.id}
      itemContent={(_, pr) => <PRRow pr={pr} />}
      components={{
        Footer: () => <div className="h-6" />,
      }}
    />
  );
}
