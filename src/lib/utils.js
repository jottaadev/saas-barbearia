// src/lib/utils.js

// A URL base da sua API. Idealmente, isto viria de uma variável de ambiente.
const API_URL = 'https://backend-barber-5sbe.onrender.com';

/**
 * Constrói de forma segura a URL completa para um recurso da API, evitando barras duplas.
 * @param {string} path - O caminho do recurso (ex: /uploads/avatar.png).
 * @returns {string} A URL completa e correta.
 */
export function getStrapiURL(path = '') {
  // Se o caminho já for uma URL completa, devolve-o diretamente.
  if (path.startsWith('http')) {
    return path;
  }
  // Garante que o caminho relativo começa com uma barra.
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${sanitizedPath}`;
}