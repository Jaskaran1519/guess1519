/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/game",
        destination: "/api/game/route",
      },
    ];
  },
};

export default nextConfig;
