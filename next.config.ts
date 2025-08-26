import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // adjust if removing inline/eval
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https: http://localhost:8080 https://api.mercadopago.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src https:",
        "object-src 'none'",
        "upgrade-insecure-requests",
      ].join('; '),
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enable only behind HTTPS in production; harmless during local dev
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'sanangel.edu.mx' }
      // { protocol: 'https', hostname: 'images.unsplash.com' },
      // { protocol: 'https', hostname: 'res.cloudinary.com' },
    ]
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': resolve(process.cwd(), 'src')
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
