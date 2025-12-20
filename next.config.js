/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.stripe.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iili.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
  },
  
  // Netlify deployment optimization
  output: 'standalone',
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Experimental performance features
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Externalize neon serverless package to prevent bundling issues
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
}

module.exports = nextConfig
