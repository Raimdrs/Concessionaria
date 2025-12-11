import api from './api';

export const getUsuarios = (headers = {}) => {
  return api.get('/usuarios', headers);
};

export const createUsuario = (dados) => {
  return api.post('/usuarios/registrar', dados);
};

export const updateUsuario = (id, dados, headers = {}) => {
  return api.put(`/usuarios/${id}`, dados, headers);
};

export const deleteUsuario = (id, headers = {}) => {
  return api.delete(`/usuarios/${id}`, headers);
};
