/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: '/api/:path*' },
      // Clean URLs for dashboards — serve HTML from public
      { source: '/admin/dashboard', destination: '/admin-dashboard.html' },
      { source: '/founder/home', destination: '/founder-home.html' },
      { source: '/founder/weekly-update', destination: '/founder-weekly-update.html' },
      { source: '/landing', destination: '/landing.html' },
    ];
  },
};

module.exports = nextConfig;
