import Link from 'next/link';
import { SignOutButton } from '@/components/cv-editor/SignOutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          CVivo
        </Link>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
