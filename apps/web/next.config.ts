import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  ...(process.env.DEMO_CAPTURE === 'true' ? { devIndicators: false as const } : {}),
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
}

export default nextConfig
