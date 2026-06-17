/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // @sparticuz/chromium + puppeteer-core must not be bundled by Next's server build;
    // they are loaded at runtime in the PDF export route handler (US3).
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
};

export default nextConfig;
