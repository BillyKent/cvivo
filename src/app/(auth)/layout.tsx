import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        CVivo
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
