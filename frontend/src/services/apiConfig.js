/**
 * Centralized API configuration for Kisan Saathi.
 * In development, defaults to relative '/api' proxy.
 * In production split deployment (Vercel + Render), prepends VITE_API_URL if configured.
 */
export const getApiUrl = (endpoint = '') => {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base.replace(/\/+$/, '')}${cleanEndpoint}` : cleanEndpoint;
};

export default getApiUrl;
