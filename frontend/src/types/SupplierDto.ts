export interface SupplierDto {
  id: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  isDeleted?: boolean;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  deviceCount: number;
}
