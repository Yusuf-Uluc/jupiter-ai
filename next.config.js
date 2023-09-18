/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  webpack(config) {
    config.externals = [
      ...(config.externals || []),
      "faiss-node",
      "hnswlib-node",
    ];
    return config;
  },
};

module.exports = nextConfig;
