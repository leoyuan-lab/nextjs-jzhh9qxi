/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/models/:path*.usdz',
        headers: [{ key: 'Content-Type', value: 'model/vnd.usdz+zip' }],
      },
      {
        source: '/models/:path*.glb',
        headers: [{ key: 'Content-Type', value: 'model/gltf-binary' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Browsers request `/favicon.ico` by default; `app/icon.png` is served at `/icon.png` only.
      { source: '/favicon.ico', destination: '/icon.svg' },
    ];
  },
  async redirects() {
    return [
      {
        source: '/zh/cobots/accessories',
        destination: '/zh/accessories',
        permanent: true,
      },
      {
        source: '/en/cobots/accessories',
        destination: '/en/accessories',
        permanent: true,
      },
      {
        source: '/arm',
        destination: '/cobots/r-lite',
        permanent: true,
      },
      {
        source: '/compare/selector',
        destination: '/cobots/all-cobots-specs',
        permanent: true,
      },
      {
        source: '/selector/all-specs',
        destination: '/cobots/all-cobots-specs',
        permanent: true,
      },
      {
        source: '/cobots/all cobots & specs',
        destination: '/cobots/all-cobots-specs',
        permanent: true,
      },
      {
        source: '/cobots/all%20cobots%20%26%20specs',
        destination: '/cobots/all-cobots-specs',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
