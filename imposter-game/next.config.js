/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove this line since we're using custom server
  // output: 'standalone',
  
  swcMinify: true,
}

module.exports = nextConfig