/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "yks-koc-takip-mvp";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : ""
};

module.exports = nextConfig;
