/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.rjconcept.in',
          },
        ],
        destination: 'https://rjconcept.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
