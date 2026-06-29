import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <div className="text-center">
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          That pull request or page doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/inbox"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:opacity-90"
        >
          Back to inbox
        </Link>
      </div>
    </main>
  );
}
