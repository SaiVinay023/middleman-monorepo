import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile shared workspace packages
  transpilePackages: ['@repo/ui', '@repo/utils'],

  // Reduce client bundle overhead from large UI libraries.
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Required for Capacitor: converts Next.js into static HTML/CSS/JS.
  // NOTE: `output: 'export'` is incompatible with `async headers()` — security
  // headers must be applied at the hosting/CDN layer (e.g., Vercel headers,
  // Nginx, or Capacitor's native webview config) when using static export.
  // To re-enable server-side headers, remove `output: 'export'` and switch to
  // a Node.js deployment (e.g., `output: 'standalone'`).
  output: 'export',

  // Mobile apps don't have a backend image optimization server
  images: {
    unoptimized: true,
  },

  // Prevents issues with Capacitor's local file protocol
  trailingSlash: true,
};

export default nextConfig;
