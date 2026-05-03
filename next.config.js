/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/arm',
        destination: '/cobots/r-core',
        permanent: true,
      },
      {
        source: '/compare/selector',
        destination: '/selector/all-specs',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
