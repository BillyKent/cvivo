import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-7 px-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-pine animate-live" />
        A living CV
      </span>

      <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        Your CV, <span className="italic text-pine">alive</span>.
      </h1>

      <p className="max-w-md text-lg text-ink-muted">
        Write on one side, watch it typeset itself on the other. Build a CV worth sending, then
        share it with a link.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-pine px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-pine-dark"
        >
          Start building
        </Link>
        <Link
          href="/signin"
          className="rounded-lg border border-line bg-paper px-5 py-2.5 font-medium transition-colors hover:bg-surface-raised"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
