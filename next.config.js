/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vercel.com'],
    unoptimized: true,
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {
        '@/*': ['./src/*']
      }
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http2: false,
        dns: false,
        path: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        os: false,
        https: false,
        http: false,
        child_process: false,
        process: require.resolve('process/browser')
      };
      
      config.resolve.alias = {
        ...config.resolve.alias,
        'process': require.resolve('process/browser')
      };
    }
    return config;
  }
}

module.exports = nextConfig 