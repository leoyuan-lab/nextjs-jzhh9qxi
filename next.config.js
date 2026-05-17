/** @type {import('next').NextConfig} */
const nextConfig = {
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
