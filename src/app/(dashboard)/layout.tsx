import Link from 'next/link';
import { SignOutButton } from '@/components/cv-editor/SignOutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface-raised/85 px-4 backdrop-blur sm:px-6">
        <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
          CVivo
        </Link>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
