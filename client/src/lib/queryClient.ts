import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Static preview mode for Netlify (no backend). Mutations are no-ops.
  if (import.meta.env.VITE_STATIC_PREVIEW === "true") {
    const body = JSON.stringify({ ok: true, preview: true });
    return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    cache: "no-store",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;

    // Static preview mode: provide client-only mock data so the UI loads on Netlify
    if (import.meta.env.VITE_STATIC_PREVIEW === "true") {
      if (path.startsWith("/api/status")) {
        const mock = {
          meals: {
            Breakfast: { eaten: [], notEaten: [], eatenCount: 0, notEatenCount: 0 },
            Lunch: { eaten: [], notEaten: [], eatenCount: 0, notEatenCount: 0 },
            Dinner: { eaten: [], notEaten: [], eatenCount: 0, notEatenCount: 0 },
          },
          expectedCount: 0,
        } as any;
        return mock as any;
      }
      if (path.startsWith("/api/preset-names")) {
        return [] as any;
      }
      return null as any;
    }

    const res = await fetch(path, {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
