using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IAuthService _authService;

        public DashboardController(IDashboardService dashboardService, IAuthService authService)
        {
            _dashboardService = dashboardService;
            _authService = authService;
        }

        [HttpGet("admin-stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStats()
        {
            var stats = await _dashboardService.GetAdminStatsAsync();
            return Ok(stats);
        }

        [HttpGet("admin-charts")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminCharts()
        {
            var charts = await _dashboardService.GetAdminChartsAsync();
            return Ok(charts);
        }

        [HttpGet("admin-tables")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminTables()
        {
            var tables = await _dashboardService.GetAdminTablesAsync();
            return Ok(tables);
        }

        [HttpGet("manager-stats")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetManagerStats([FromQuery] Guid departmentId)
        {
            var stats = await _dashboardService.GetManagerStatsAsync(departmentId);
            return Ok(stats);
        }

        [HttpGet("manager-charts")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetManagerCharts([FromQuery] Guid departmentId)
        {
            var charts = await _dashboardService.GetManagerChartsAsync(departmentId);
            return Ok(charts);
        }

        [HttpGet("manager-tables")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetManagerTables([FromQuery] Guid departmentId)
        {
            var tables = await _dashboardService.GetManagerTablesAsync(departmentId);
            return Ok(tables);
        }

        [HttpGet("technician-stats")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetTechnicianStats()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var stats = await _dashboardService.GetTechnicianStatsAsync(userId.Value);
            return Ok(stats);
        }

        [HttpGet("technician-charts")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetTechnicianCharts()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var charts = await _dashboardService.GetTechnicianChartsAsync(userId.Value);
            return Ok(charts);
        }

        [HttpGet("technician-tables")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetTechnicianTables()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var tables = await _dashboardService.GetTechnicianTablesAsync(userId.Value);
            return Ok(tables);
        }

        [HttpGet("employee-stats")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetEmployeeStats()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var stats = await _dashboardService.GetEmployeeStatsAsync(userId.Value);
            return Ok(stats);
        }

        [HttpGet("employee-charts")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetEmployeeCharts()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var charts = await _dashboardService.GetEmployeeChartsAsync(userId.Value);
            return Ok(charts);
        }

        [HttpGet("employee-tables")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetEmployeeTables()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (!userId.HasValue) return Unauthorized();

            var tables = await _dashboardService.GetEmployeeTablesAsync(userId.Value);
            return Ok(tables);
        }
    }
}

