"use client";

/**
 * TanStack Query provider for the RIYAAZ application.
 *
 * Wraps the component tree with QueryClientProvider using sensible
 * defaults for stale time and retry behaviour.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 30 seconds before a background refetch.
        staleTime: 30 * 1000,
        // Retry failed queries up to 2 times with exponential backoff.
        retry: 2,
        // Don't refetch on window focus during development.
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  // Create the QueryClient once per component lifecycle to avoid
  // sharing state between requests in SSR.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
