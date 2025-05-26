import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  experimental: {
    reactCompiler: false,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Disable X-Powered-By header
  poweredByHeader: false,
  // Compress static files
  compress: true,
  // Generate build ID
  generateBuildId: async () => {
    return 'payload-v3-build-' + Date.now();
  },
  // TypeScript configuration for Payload v3
  typescript: {
    // Ignore TypeScript errors during build (optional)
    ignoreBuildErrors: false,
  },
  eslint: { ignoreDuringBuilds: true },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
