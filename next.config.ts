import type { NextConfig } from "next";

// Set only for the HS deploy (shared box, path-routed alongside Hauser and
// future sibling apps) — empty locally and on any root-mounted deploy.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
