import axios from './axios';
import { SupplierDto } from '../types/SupplierDto';

export const getAllSuppliers = (isDeleted?: boolean) =>
  axios.get<SupplierDto[]>('/suppliers', { params: { isDeleted } });
export const createSupplier = (data: SupplierDto) => axios.post('/suppliers', data);
export const updateSupplier = (id: string, data: SupplierDto) => axios.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id: string) => axios.delete(`/suppliers/${id}`);
export const restoreSupplier = (id: string) => axios.put(`/suppliers/${id}/restore`);
