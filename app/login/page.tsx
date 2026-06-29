import Link from "next/link";
import { isMockMode } from "@/lib/env";
import { signIn } from "@/auth";
import { LoginButtons } from "./login-buttons";

export default function LoginPage() {
  // In mock mode there is nothing to authenticate against — go straight in.
  if (isMockMode) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg px-6">
        <div className="w-full max-w-sm text-center">
          <Brand />
          <p className="mt-3 text-sm text-muted">
            Running in <span className="text-fg">demo mode</span> with sample
            data. Add GitHub OAuth credentials to connect a real account.
          </p>
          <Link
            href="/inbox"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-fg hover:opacity-90"
          >
            Enter the demo
          </Link>
        </div>
      </main>
    );
  }

  async function authenticate() {
    "use server";
    await signIn("github", { redirectTo: "/inbox" });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm text-center">
        <Brand />
        <p className="mt-3 text-sm text-muted">
          Sign in with GitHub to triage pull requests across your repositories.
        </p>
        <div className="mt-6">
          <LoginButtons action={authenticate} />
        </div>
        <p className="mt-4 text-xs text-muted">
          Lane requests <code className="font-mono">repo</code> and{" "}
          <code className="font-mono">read:user</code> scopes to read PRs and
          submit reviews on your behalf.
        </p>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex flex-col items-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-fg">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M5 4v11a3 3 0 0 0 3 3h7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="5" cy="4" r="2.4" fill="currentColor" />
          <circle cx="17" cy="18" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg">Lane</h1>
      <p className="text-sm text-muted">A focused pull request review inbox</p>
    </div>
  );
}

// Avoid static prerender so session/redirect logic runs at request time.
export const dynamic = "force-dynamic";
