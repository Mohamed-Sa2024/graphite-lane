import "server-only";
import { auth } from "@/auth";
import { createGitHubClient, type GitHubClient } from "./client";

/** Returns a GitHub client bound to the session token, or null in mock mode. */
export async function getClient(): Promise<GitHubClient | null> {
  const session = await auth();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) return null;
  return createGitHubClient(token);
}
