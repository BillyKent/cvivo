import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">CVivo</h1>
      <p className="text-lg text-gray-600">Create, host, and share a great, professional CV.</p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Get started
        </Link>
        <Link
          href="/signin"
          className="rounded-md border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
