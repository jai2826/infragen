/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty', 'pg', '@prisma/adapter-pg'],
  },
};

export default nextConfig;
