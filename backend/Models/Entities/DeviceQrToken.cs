using System;

namespace backend.Models.Entities
{
    public class DeviceQrToken
    {
        public Guid Id { get; set; }
        public Guid DeviceId { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public bool IsActive { get; set; }

        public virtual Device? Device { get; set; }
    }
}


