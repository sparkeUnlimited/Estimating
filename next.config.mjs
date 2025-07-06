/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_TOMORROW_API_KEY: process.env.NEXT_PUBLIC_TOMORROW_API_KEY,
  },
};

export default nextConfig;
