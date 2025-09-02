// src/types/DepartmentDto.ts

export interface DepartmentDto {
  id: string;
  departmentName: string;
  departmentCode: string;
  location: string;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  deviceCount: number;
  userCount: number; 
}
