import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile TensorFlow packages
  transpilePackages: [
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-converter',
    '@tensorflow-models/pose-detection',
  ],

  // Webpack configuration for TensorFlow
  webpack: (config, { isServer }) => {
    // Handle TensorFlow.js in browser only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Ignore specific tensorflow warnings
    config.ignoreWarnings = [
      { module: /@tensorflow/ },
    ];

    return config;
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
