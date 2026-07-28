/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo-intel/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
