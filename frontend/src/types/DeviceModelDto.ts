export interface DeviceModelDto {
  id: string;
  modelName: string;
  deviceTypeId: string | null;
  typeName?: string; // để hiển thị
  manufacturer?: string;
  specifications?: string;
  isDeleted: boolean;
  updatedAt?: string;
  deletedAt?: string;
}
