import api from './api';

export const getLojas = async (headers = {}) => {
  try {
    const response = await api.get('/lojas/', headers);
    return response;
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    throw error;
  }
};

export const createLoja = async (loja) => {
  try {
    const response = await api.post('/lojas/', loja);
    return response;
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    throw error;
  }
};