import Link from 'next/link';

export default function ShareNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-display text-5xl font-semibold text-ink">404</span>
      <div>
        <h1 className="text-lg font-medium text-ink">This link isn’t active</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The CV may have been unshared, or the link was mistyped.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-pine px-5 py-2.5 font-medium text-white transition-colors hover:bg-pine-dark"
      >
        Go to CVivo
      </Link>
    </main>
  );
}
