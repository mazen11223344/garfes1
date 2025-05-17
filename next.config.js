/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {
        // Enables the usage of @/ imports
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