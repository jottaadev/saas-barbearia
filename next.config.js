/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para permitir imagens do seu backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;