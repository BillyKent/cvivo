import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 px-6 py-10">
      <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
        CVivo
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-7 shadow-raised">
        {children}
      </div>
    </main>
  );
}
