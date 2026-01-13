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

  // Webpack configuration for TensorFlow and Paper.js
  webpack: (config, { isServer }) => {
    // Handle browser-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
      };
    }

    // Ignore Paper.js Node.js modules (we only use browser version)
    config.resolve.alias = {
      ...config.resolve.alias,
      'jsdom/lib/jsdom/living/generated/utils': false,
      'jsdom': false,
    };

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /@tensorflow/ },
      { module: /paper/ },
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
