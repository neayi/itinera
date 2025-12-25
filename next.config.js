/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configuration Turbopack (Next.js 16+)
  turbopack: {},
  // Activer le mode standalone pour Docker
  output: 'standalone',
};

module.exports = nextConfig;
