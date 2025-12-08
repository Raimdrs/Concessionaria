import api from './api';

// GET: Aceita config (para passar headers)
export const getVeiculos = (config) => api.get('/veiculos', config);

// CREATE: Aceita data E config
export const createVeiculo = (data, config) => api.post('/veiculos', data, config);

// UPDATE: Aceita id, data E config
export const updateVeiculo = (id, data, config) => api.put(`/veiculos/${id}`, data, config);

// DELETE: Aceita id E config
export const deleteVeiculo = (id, config) => api.delete(`/veiculos/${id}`, config);