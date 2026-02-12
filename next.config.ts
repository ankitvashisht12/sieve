import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["langsmith", "gray-matter", "@anthropic-ai/sdk"],
};

export default nextConfig;
