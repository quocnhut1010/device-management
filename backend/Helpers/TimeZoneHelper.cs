using System;

namespace backend.Helpers
{
    public static class TimeZoneHelper
    {
        private static readonly TimeZoneInfo VietnamTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        public static DateTime ConvertUtcToVietnam(DateTime dateTime)
        {
            if (dateTime.Kind == DateTimeKind.Unspecified)
            {
                dateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
            }

            if (dateTime.Kind != DateTimeKind.Utc)
            {
                dateTime = dateTime.ToUniversalTime();
            }

            return TimeZoneInfo.ConvertTimeFromUtc(dateTime, VietnamTimeZone);
        }

        public static DateTime? ConvertUtcToVietnam(DateTime? dateTime)
        {
            return dateTime.HasValue ? ConvertUtcToVietnam(dateTime.Value) : null;
        }
    }
}

