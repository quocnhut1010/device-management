import axios from './axios';
export const getAllSuppliers = (isDeleted) => axios.get('/suppliers', { params: { isDeleted } });
export const createSupplier = (data) => axios.post('/suppliers', data);
export const updateSupplier = (id, data) => axios.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`/suppliers/${id}`);
export const restoreSupplier = (id) => axios.put(`/suppliers/${id}/restore`);
