import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Drafting desk" palette — a warm greige workspace, ink text, and a single
        // disciplined pine-green accent. Deliberately not the SaaS gray + indigo default.
        paper: '#ffffff',
        surface: {
          DEFAULT: '#eae7e0', // the desk
          raised: '#f3f1eb', // panels resting on it
        },
        ink: {
          DEFAULT: '#1f1b16',
          muted: '#6e665e',
        },
        line: '#dbd6cc',
        pine: {
          DEFAULT: '#1e5e50',
          dark: '#17493d',
          tint: '#e6efeb',
        },
        clay: {
          DEFAULT: '#a23b2d',
          tint: '#f6e7e2',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        // A sheet of paper lifted off the desk.
        sheet: '0 1px 2px rgba(31,27,22,0.05), 0 18px 40px -16px rgba(31,27,22,0.28)',
        raised: '0 1px 2px rgba(31,27,22,0.04), 0 8px 20px -12px rgba(31,27,22,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
