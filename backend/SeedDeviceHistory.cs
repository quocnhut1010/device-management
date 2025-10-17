using System;
using backend.Data;
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend
{
    public static class DeviceHistorySeed
    {
        public static async Task SeedDeviceHistoryAsync(DeviceManagementDbContext context)
        {
            // Check if we already have some device history data
            var hasData = await context.DeviceHistories.AnyAsync();
            if (hasData)
            {
                Console.WriteLine("DeviceHistory table already has data. Skipping seed.");
                return;
            }

            Console.WriteLine("Seeding DeviceHistory table...");

            // Get some devices and users to reference
            var devices = await context.Devices.Take(5).ToListAsync();
            var users = await context.Users.Take(3).ToListAsync();

            if (!devices.Any() || !users.Any())
            {
                Console.WriteLine("No devices or users found. Please seed Devices and Users first.");
                return;
            }

            var random = new Random();
            var actions = new[] { "CREATED", "UPDATED", "DELETED", "ASSIGNED", "UNASSIGNED", "ACTIVATED", "DEACTIVATED", "MAINTENANCE", "REPAIRED", "REPLACED" };
            var actionTypes = new[] { "SYSTEM", "USER", "MAINTENANCE", "ADMIN" };

            var historyEntries = new List<DeviceHistory>();

            // Generate 50 sample history entries
            for (int i = 0; i < 50; i++)
            {
                var device = devices[random.Next(devices.Count)];
                var user = users[random.Next(users.Count)];
                var action = actions[random.Next(actions.Length)];
                var actionType = actionTypes[random.Next(actionTypes.Length)];

                historyEntries.Add(new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = device.Id,
                    Action = action,
                    ActionBy = user.Id,
                    ActionDate = DateTime.Now.AddDays(-random.Next(0, 30)).AddHours(-random.Next(0, 24)),
                    Description = $"Sample {action.ToLower()} action for {device.DeviceName}",
                    ActionType = actionType
                });
            }

            context.DeviceHistories.AddRange(historyEntries);
            await context.SaveChangesAsync();

            Console.WriteLine($"Successfully seeded {historyEntries.Count} device history entries.");
        }
    }
}