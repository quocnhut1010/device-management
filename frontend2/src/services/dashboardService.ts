import api from './api'

// Stats DTOs
export interface AdminStatsDto {
  totalDevices: number
  devicesInUse: number
  devicesAvailable: number
  devicesRepairing: number
  devicesPendingLiquidation: number
  openIncidents: number
  activeRepairs: number
  replacementsThisWeek: number
  liquidationsThisMonth: number
  unreadNotifications: number
}

export interface ManagerStatsDto {
  departmentDevices: number
  devicesInUse: number
  devicesRepairing: number
  openIncidents: number
  availableDevices: number
  ongoingRepairs: number
}

export interface TechnicianStatsDto {
  repairsPending: number
  repairsInProgress: number
  repairsAwaitingApproval: number
  repairsCompletedThisWeek: number
  avgRepairTime: string
}

export interface EmployeeStatsDto {
  myDevices: number
  devicesActive: number
  devicesRepairing: number
  myIncidentsOpen: number
  myIncidentsPending: number
  activeIssues: number
  resolvedIncidents: number
}

// Chart DTOs
export interface DevicesByDepartmentDto {
  departmentName: string
  deviceCount: number
}

export interface DevicesByStatusDto {
  status: string
  count: number
}

export interface IncidentTrendDto {
  period: string
  count: number
}

export interface RepairTrendDto {
  week: string
  assigned: number
  completed: number
}

export interface RepairMetricsDto {
  category: string
  mttr: number
  mtbf: number
}

export interface FrequentDevicesDto {
  deviceName: string
  deviceCode: string
  repairCount: number
}

export interface DepartmentIncidentsTrendDto {
  period: string
  count: number
}

// Table DTOs
export interface RiskDeviceDto {
  id: string
  deviceName: string
  deviceCode: string
  incidentCount: number
  age: string
  recommendation: string
}

export interface ReplacementHistoryDto {
  id: string
  deviceName: string
  deviceCode: string
  replacedDeviceName: string
  replacedDeviceCode: string
  replacementDate: string
  reason: string
}

export interface WorkQueueDto {
  id: string
  deviceName: string
  deviceCode: string
  priority: string
  sla: string
  createdDate: string
  status: number
}

export interface RecentIncidentDto {
  id: string
  deviceCode: string
  deviceName: string
  reportedBy: string
  reportDate: string
  status: number
  description: string
  reportType: string
}

export interface ActiveRepairDto {
  id: string
  deviceCode: string
  deviceName: string
  technicianName: string
  slaRemaining: string
  status: number
  startDate?: string
}

export interface DepartmentDeviceDto {
  id: string
  deviceCode: string
  deviceName: string
  status: string
  assignedTo: string
  warrantyExpiry?: string
}

export interface DepartmentIncidentDto {
  id: string
  deviceCode: string
  deviceName: string
  reportedBy: string
  reportDate: string
  status: number
  reportType: string
}

export interface DepartmentRepairDto {
  id: string
  deviceCode: string
  deviceName: string
  technicianName: string
  status: number
  startDate?: string
  endDate?: string
}

export interface MyDeviceDto {
  id: string
  deviceCode: string
  deviceName: string
  status: string
  warrantyExpiry?: string
  departmentName: string
}

export interface MyIncidentDto {
  id: string
  deviceCode: string
  deviceName: string
  reportDate: string
  status: number
  reportType: string
  description: string
}

export interface RepairHistoryDto {
  id: string
  deviceCode: string
  deviceName: string
  status: number
  startDate?: string
  endDate?: string
  cost?: number
  description: string
}

// Admin Charts Response
export interface AdminChartsResponse {
  devicesByDepartment: DevicesByDepartmentDto[]
  devicesByStatus: DevicesByStatusDto[]
  incidentTrend: IncidentTrendDto[]
  repairMetrics: RepairMetricsDto[]
}

// Admin Tables Response
export interface AdminTablesResponse {
  recentIncidents: RecentIncidentDto[]
  activeRepairs: ActiveRepairDto[]
  riskDevices: RiskDeviceDto[]
  replacementHistory: ReplacementHistoryDto[]
}

// Manager Charts Response
export interface ManagerChartsResponse {
  devicesByStatus: DevicesByStatusDto[]
  departmentIncidentsTrend: DepartmentIncidentsTrendDto[]
}

// Manager Tables Response
export interface ManagerTablesResponse {
  departmentDevices: DepartmentDeviceDto[]
  departmentIncidents: DepartmentIncidentDto[]
  departmentRepairs: DepartmentRepairDto[]
}

// Technician Charts Response
export interface TechnicianChartsResponse {
  repairTrend: RepairTrendDto[]
  frequentDevices: FrequentDevicesDto[]
}

// Technician Tables Response
export interface TechnicianTablesResponse {
  workQueue: WorkQueueDto[]
  repairHistory: RepairHistoryDto[]
}

// Employee Charts Response
export interface EmployeeChartsResponse {
  devicesByStatus: DevicesByStatusDto[]
  myIncidentsTrend: IncidentTrendDto[]
}

// Employee Tables Response
export interface EmployeeTablesResponse {
  myDevices: MyDeviceDto[]
  myIncidents: MyIncidentDto[]
}

// Admin API methods
export const getAdminStats = async (): Promise<AdminStatsDto> => {
  const response = await api.get('/Dashboard/admin-stats')
  return response.data
}

export const getAdminCharts = async (): Promise<AdminChartsResponse> => {
  const response = await api.get('/Dashboard/admin-charts')
  return response.data
}

export const getAdminTables = async (): Promise<AdminTablesResponse> => {
  const response = await api.get('/Dashboard/admin-tables')
  return response.data
}

// Manager API methods
export const getManagerStats = async (departmentId: string): Promise<ManagerStatsDto> => {
  const response = await api.get('/Dashboard/manager-stats', {
    params: { departmentId },
  })
  return response.data
}

export const getManagerCharts = async (departmentId: string): Promise<ManagerChartsResponse> => {
  const response = await api.get('/Dashboard/manager-charts', {
    params: { departmentId },
  })
  return response.data
}

export const getManagerTables = async (departmentId: string): Promise<ManagerTablesResponse> => {
  const response = await api.get('/Dashboard/manager-tables', {
    params: { departmentId },
  })
  return response.data
}

// Technician API methods
export const getTechnicianStats = async (): Promise<TechnicianStatsDto> => {
  const response = await api.get('/Dashboard/technician-stats')
  return response.data
}

export const getTechnicianCharts = async (): Promise<TechnicianChartsResponse> => {
  const response = await api.get('/Dashboard/technician-charts')
  return response.data
}

export const getTechnicianTables = async (): Promise<TechnicianTablesResponse> => {
  const response = await api.get('/Dashboard/technician-tables')
  return response.data
}

// Employee API methods
export const getEmployeeStats = async (): Promise<EmployeeStatsDto> => {
  const response = await api.get('/Dashboard/employee-stats')
  return response.data
}

export const getEmployeeCharts = async (): Promise<EmployeeChartsResponse> => {
  const response = await api.get('/Dashboard/employee-charts')
  return response.data
}

export const getEmployeeTables = async (): Promise<EmployeeTablesResponse> => {
  const response = await api.get('/Dashboard/employee-tables')
  return response.data
}

