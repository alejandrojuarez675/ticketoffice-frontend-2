// next.config.js (reemplaza el archivo completo por este; adapta los hosts si hace falta)
import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
let apiOrigin = '';
try { apiOrigin = apiBase ? new URL(apiBase).origin : ''; } catch {}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' <https://sdk.mercadopago.com> https://*.mercadopago.com https://*.mercadopago.com.ar https://*.mercadopago.com.co",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  [
    "connect-src 'self'",
    '<http://localhost:8080>',
    '<https://api.mercadopago.com>',
    apiOrigin || '',
  ]
    .filter(Boolean)
    .join(' '),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src https: <https://sdk.mercadopago.com> https://*.mercadopago.com",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'sanangel.edu.mx' },
      // agrega aquí el CDN (CloudFront/Cloudinary)
      // { protocol: 'https', hostname: 'dXXXX.cloudfront.net' },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': resolve(process.cwd(), 'src'),
    };
    return config;
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

