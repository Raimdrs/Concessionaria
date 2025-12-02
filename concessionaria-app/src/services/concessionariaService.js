import api from './api';

export const getConcessionarias = () => api.get('/concessionarias');
export const createConcessionaria = (data) => api.post('/concessionarias', data);
export const deleteConcessionaria = (id) => api.delete(`/concessionarias/${id}`);
