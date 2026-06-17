import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import './globals.css';

// Display serif (used with restraint for the wordmark + section eyebrows) and a clean
// grotesk for UI — a deliberate pairing, not the default Inter-on-everything.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CVivo',
    template: '%s · CVivo',
  },
  description: 'Create, host, and share a great, professional CV.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-pine focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
