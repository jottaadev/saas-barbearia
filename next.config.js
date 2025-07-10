/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para permitir imagens do seu backend
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Protocolo para o backend em produção
        hostname: 'backend-barber-5sbe.onrender.com', // Domínio do seu backend
        port: '',
        pathname: '/uploads/**', // Caminho onde as imagens estão
      },
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