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
  // Configuration pour le hot reload dans Docker
  webpack: (config, { isServer }) => {
    // Polling pour le watch dans Docker
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
