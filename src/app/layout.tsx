import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CVivo',
  description: 'Create, host, and share a great, professional CV.',
};

// Minimal root layout (Phase 1). Expanded with shared chrome/providers in T018.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
