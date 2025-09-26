using backend.Services.Interfaces;
using backend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly IIncidentReportService _incidentService;

        public DebugController(IIncidentReportService incidentService)
        {
            _incidentService = incidentService;
        }

        [HttpPost("test-approval/{id}")]
        public async Task<IActionResult> TestApproval(Guid id)
        {
            try
            {
                Console.WriteLine($"🔍 Debug: Starting approval test for ID: {id}");
                
                var updatedBy = "debug-user";
                var result = await _incidentService.ApproveAndCreateRepairAsync(id, updatedBy);
                
                Console.WriteLine($"🔍 Debug: Approval result - Success: {result.Success}, Message: {result.Message}");
                
                if (result.Success)
                {
                    // Return simplified data without navigation properties to avoid cycles
                    var repairData = result.Data as Repair;
                    var simplifiedData = repairData != null ? new {
                        id = repairData.Id,
                        deviceId = repairData.DeviceId,
                        incidentReportId = repairData.IncidentReportId,
                        description = repairData.Description,
                        status = repairData.Status,
                        startDate = repairData.StartDate
                    } : null;
                    
                    return Ok(new { 
                        success = true, 
                        message = result.Message, 
                        data = simplifiedData 
                    });
                }
                else
                {
                    return BadRequest(new { 
                        success = false, 
                        message = result.Message,
                        error = "Approval failed"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Debug: Exception caught in controller: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"💥 Debug: Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"💥 Debug: Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new { 
                    error = "Internal server error", 
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("test-connection")]
        public IActionResult TestConnection()
        {
            return Ok(new { 
                message = "Debug controller is working", 
                timestamp = DateTime.UtcNow 
            });
        }

        [HttpGet("list-incidents")]
        public async Task<IActionResult> ListIncidents()
        {
            try
            {
                var incidents = await _incidentService.GetAllAsync();
                return Ok(incidents.Take(5)); // First 5 for testing
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}