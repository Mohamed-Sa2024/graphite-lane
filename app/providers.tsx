"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useUI } from "@/store/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  const initTheme = useUI((s) => s.initTheme);
  useEffect(() => initTheme(), [initTheme]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
