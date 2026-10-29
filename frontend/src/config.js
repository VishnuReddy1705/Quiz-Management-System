// Centralized API Base URL
// In development: defaults to http://localhost:5050
// In production (Vercel): uses the environment variable VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export default API_BASE;
