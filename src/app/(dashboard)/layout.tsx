import Link from 'next/link';
import { SignOutButton } from '@/components/cv-editor/SignOutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface-raised/85 px-4 backdrop-blur sm:px-6">
        <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
          CVivo
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/account"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Account
          </Link>
          <SignOutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
