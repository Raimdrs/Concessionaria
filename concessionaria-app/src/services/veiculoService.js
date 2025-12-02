import api from './api';

export const getVeiculos = () => api.get('/veiculos');
export const createVeiculo = (data) => api.post('/veiculos', data);
export const updateVeiculo = (id, data) => api.put(`/veiculos/${id}`, data);
export const deleteVeiculo = (id) => api.delete(`/veiculos/${id}`);
