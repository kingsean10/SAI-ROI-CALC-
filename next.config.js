/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/SAI-ROI-CALC-',
  assetPrefix: '/SAI-ROI-CALC-/',
  trailingSlash: true,
}

module.exports = nextConfig 