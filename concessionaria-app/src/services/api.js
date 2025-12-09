import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (Onde a mágica acontece)
api.interceptors.request.use(
  (config) => {
    // 1. Busca os dados salvos no navegador
    const dadosUsuario = localStorage.getItem('usuario');
    
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);

      // 2. Adiciona o Token de Autenticação (se houver)
      if (usuario.token) {
        config.headers.Authorization = `Bearer ${usuario.token}`;
      }

      // 3. Adiciona o ID do usuário (Correção para o erro "ID não fornecido")
      // O backend parece estar exigindo esse header específico
      if (usuario._id) {
        config.headers['user-id'] = usuario._id;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses (tratar erros globalmente)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Se der erro 401 (Não autorizado), pode ser token expirado
    if (error.response && error.response.status === 401) {
       // Opcional: Você pode forçar o logout aqui se quiser
       // localStorage.removeItem('usuario');
       // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;