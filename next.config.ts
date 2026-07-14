import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from the preview environment
  allowedDevOrigins: [
    "https://preview-chat-ee072379-6f57-4edf-bf3a-01dfdd7be3fe.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
