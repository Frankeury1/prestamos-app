// Configuración central de axios para conectar con el backend
// Todas las peticiones al backend pasan por aquí
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Puerto del backend NestJS
});

// Interceptor: agrega el token JWT automáticamente a cada petición
// Así no tienes que agregarlo manualmente en cada llamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;