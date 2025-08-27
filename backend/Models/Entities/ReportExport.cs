using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class ReportExport
{
    public Guid Id { get; set; }

    public Guid? ExportedBy { get; set; }

    public string? ReportType { get; set; }

    public DateTime? ExportDate { get; set; }

    public string? FileUrl { get; set; }

    public virtual User? ExportedByNavigation { get; set; }
}
