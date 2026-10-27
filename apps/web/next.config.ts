import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/aicte-logo.png",
        destination: "http://127.0.0.1:8001/aicte-logo.png",
      },
      {
        source: "/backend/app/static/images/aicte-logo.png",
        destination: "http://127.0.0.1:8001/aicte-logo.png",
      },
      {
        source: "/backend/app/static/images/college_campus_hero.png",
        destination: "http://127.0.0.1:8001/college_campus_hero.jpg",
      },
      {
        source: "/college_campus_hero.jpg",
        destination: "http://127.0.0.1:8001/college_campus_hero.jpg",
      },
      {
        source: "/college_campus_hero.png",
        destination: "http://127.0.0.1:8001/college_campus_hero.jpg",
      },
    ];
  },
};

export default nextConfig;
