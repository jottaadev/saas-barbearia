// src/lib/utils.js

const API_URL = 'https://backend-barber-5sbe.onrender.com';

/**
 * Constrói de forma segura a URL completa para um recurso da API.
 * @param {string | null | undefined} path - O caminho do recurso.
 * @returns {string} A URL completa e correta, ou uma string vazia se o caminho for inválido.
 */
export function getStrapiURL(path = '') {
  // Se o caminho for nulo, indefinido ou uma string vazia, retorna uma string vazia.
  if (!path) {
    return '';
  }

  // Se o caminho já for uma URL completa, devolve-o diretamente.
  if (path.startsWith('http')) {
    return path;
  }
  
  // Garante que o caminho relativo começa com uma barra.
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${sanitizedPath}`;
}