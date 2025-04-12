/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Update this to match your GitHub repository name
  basePath: '/ROI-Calc-OLD',
  assetPrefix: '/ROI-Calc-OLD/',
}

module.exports = nextConfig 