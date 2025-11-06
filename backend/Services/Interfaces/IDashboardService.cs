using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDashboardService
    {
        // Admin
        Task<AdminStatsDto> GetAdminStatsAsync();
        Task<object> GetAdminChartsAsync();
        Task<object> GetAdminTablesAsync();

        // Manager
        Task<ManagerStatsDto> GetManagerStatsAsync(Guid departmentId);
        Task<object> GetManagerChartsAsync(Guid departmentId);

        // Technician
        Task<TechnicianStatsDto> GetTechnicianStatsAsync(Guid technicianId);
        Task<object> GetTechnicianChartsAsync(Guid technicianId);

        // Employee
        Task<EmployeeStatsDto> GetEmployeeStatsAsync(Guid userId);
        Task<object> GetEmployeeChartsAsync(Guid userId);
    }
}

