// src/types/UserDto.ts
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  position?: string;
  createdAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  updatedAt?: string;
}

export interface RegisterUserDto {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  departmentId?: string;
  position?: string;
}
