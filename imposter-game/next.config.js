/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization for deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during builds
  },
  // Enable standalone output for custom server
  output: 'standalone',
}

module.exports = nextConfig