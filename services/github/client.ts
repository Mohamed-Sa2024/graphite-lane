/**
 * A small, dependency-free GitHub client.
 * Features: GraphQL + REST, in-flight request deduplication, cursor pagination
 * helper, rate-limit awareness, and typed errors.
 */

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_BASE = "https://api.github.com";

export type GitHubErrorType =
  | "auth"
  | "rate_limit"
  | "not_found"
  | "graphql"
  | "network"
  | "unknown";

export class GitHubError extends Error {
  type: GitHubErrorType;
  status?: number;
  resetAt?: number;
  constructor(
    message: string,
    type: GitHubErrorType,
    status?: number,
    resetAt?: number,
  ) {
    super(message);
    this.name = "GitHubError";
    this.type = type;
    this.status = status;
    this.resetAt = resetAt;
  }
}

interface ClientState {
  remaining: number | null;
  resetAt: number | null;
}

export interface GitHubClient {
  graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
  rest<T>(path: string, init?: RequestInit): Promise<T>;
  /** Drain a GraphQL connection across pages. */
  paginate<T>(
    query: string,
    variables: Record<string, unknown>,
    select: (data: any) => {
      nodes: T[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    },
    max?: number,
  ): Promise<T[]>;
  state: ClientState;
}

function rateLimitFromHeaders(res: Response): {
  remaining: number | null;
  resetAt: number | null;
} {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  return {
    remaining: remaining != null ? Number(remaining) : null,
    resetAt: reset != null ? Number(reset) * 1000 : null,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createGitHubClient(token: string): GitHubClient {
  const inflight = new Map<string, Promise<unknown>>();
  const state: ClientState = { remaining: null, resetAt: null };

  const baseHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  async function request(
    url: string,
    init: RequestInit,
    attempt = 0,
  ): Promise<Response> {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e) {
      throw new GitHubError(
        `Network error contacting GitHub: ${(e as Error).message}`,
        "network",
      );
    }

    const rl = rateLimitFromHeaders(res);
    if (rl.remaining != null) state.remaining = rl.remaining;
    if (rl.resetAt != null) state.resetAt = rl.resetAt;

    // Secondary rate limit / abuse detection — retry once with backoff.
    if ((res.status === 403 || res.status === 429) && attempt < 1) {
      const retryAfter = res.headers.get("retry-after");
      const wait = retryAfter ? Number(retryAfter) * 1000 : 2000;
      await sleep(wait);
      return request(url, init, attempt + 1);
    }

    if (res.status === 401) {
      throw new GitHubError("GitHub session expired or invalid.", "auth", 401);
    }
    if (
      res.status === 403 &&
      state.remaining === 0 &&
      state.resetAt != null
    ) {
      throw new GitHubError(
        "GitHub API rate limit reached.",
        "rate_limit",
        403,
        state.resetAt,
      );
    }
    return res;
  }

  function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;
    const p = fn().finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  }

  const client: GitHubClient = {
    state,

    async graphql<T>(query: string, variables: Record<string, unknown> = {}) {
      const key = `gql:${query}:${JSON.stringify(variables)}`;
      return dedupe(key, async () => {
        const res = await request(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { ...baseHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });
        const json = await res.json();
        if (json.errors?.length) {
          const msg = json.errors.map((e: any) => e.message).join("; ");
          throw new GitHubError(msg, "graphql", res.status);
        }
        return json.data as T;
      });
    },

    async rest<T>(path: string, init: RequestInit = {}) {
      const url = path.startsWith("http") ? path : `${REST_BASE}${path}`;
      const key = `rest:${init.method ?? "GET"}:${url}:${
        typeof init.body === "string" ? init.body : ""
      }`;
      return dedupe(key, async () => {
        const res = await request(url, {
          ...init,
          headers: { ...baseHeaders, ...(init.headers ?? {}) },
        });
        if (res.status === 404) {
          throw new GitHubError(`Not found: ${path}`, "not_found", 404);
        }
        if (!res.ok) {
          const body = await res.text();
          throw new GitHubError(
            `GitHub REST error ${res.status}: ${body.slice(0, 200)}`,
            "unknown",
            res.status,
          );
        }
        if (res.status === 204) return undefined as T;
        return (await res.json()) as T;
      });
    },

    async paginate<T>(
      query: string,
      variables: Record<string, unknown>,
      select: (data: any) => {
        nodes: T[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      },
      max = 200,
    ): Promise<T[]> {
      const all: T[] = [];
      let cursor: string | null = null;
      // hard cap on pages to respect rate limits
      for (let i = 0; i < 10; i++) {
        const data = await client.graphql<any>(query, { ...variables, cursor });
        const { nodes, pageInfo } = select(data);
        all.push(...nodes);
        if (!pageInfo.hasNextPage || all.length >= max) break;
        cursor = pageInfo.endCursor;
      }
      return all.slice(0, max);
    },
  };

  return client;
}
