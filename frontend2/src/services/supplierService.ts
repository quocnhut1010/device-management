import api from './api'
import type { SupplierDto } from '@/types'

// Get all suppliers
export const getAllSuppliers = (isDeleted?: boolean) => {
  const params = isDeleted !== undefined ? { isDeleted } : {}
  return api.get<SupplierDto[]>('/Suppliers', { params })
}

// Get supplier by ID
export const getSupplierById = (id: string) =>
  api.get<SupplierDto>(`/Suppliers/${id}`)

// Create supplier
export const createSupplier = (data: Partial<SupplierDto>) =>
  api.post<SupplierDto>('/Suppliers', data)

// Update supplier
export const updateSupplier = (id: string, data: Partial<SupplierDto>) =>
  api.put<SupplierDto>(`/Suppliers/${id}`, data)

// Delete supplier (soft delete)
export const deleteSupplier = (id: string) =>
  api.delete(`/Suppliers/${id}`)

// Restore supplier
export const restoreSupplier = (id: string) =>
  api.put(`/Suppliers/${id}/restore`)

// Get active suppliers only
export const getActiveSuppliers = () =>
  api.get<SupplierDto[]>('/Suppliers', { params: { isDeleted: false } })

// Supplier service object
export const supplierService = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
  getActiveSuppliers,
}

