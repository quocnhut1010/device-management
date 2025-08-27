using System;
using System.Collections.Generic;
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public partial class DeviceManagementDbContext : DbContext
{
    public DeviceManagementDbContext()
    {
    }

    public DeviceManagementDbContext(DbContextOptions<DeviceManagementDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Device> Devices { get; set; }

    public virtual DbSet<DeviceAssignment> DeviceAssignments { get; set; }

    public virtual DbSet<DeviceHistory> DeviceHistories { get; set; }

    public virtual DbSet<DeviceModel> DeviceModels { get; set; }

    public virtual DbSet<DeviceStatusLog> DeviceStatusLogs { get; set; }

    public virtual DbSet<DeviceType> DeviceTypes { get; set; }

    public virtual DbSet<IncidentReport> IncidentReports { get; set; }

    public virtual DbSet<Liquidation> Liquidations { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Repair> Repairs { get; set; }

    public virtual DbSet<RepairFeedback> RepairFeedbacks { get; set; }

    public virtual DbSet<RepairImage> RepairImages { get; set; }

    public virtual DbSet<Replacement> Replacements { get; set; }

    public virtual DbSet<ReportExport> ReportExports { get; set; }

    public virtual DbSet<Supplier> Suppliers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Server=DESKTOP-GL89FUU\\SQLEXPRESS;Database=DeviceManagementDB;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Departme__3214EC07A2FFC172");

            entity.HasIndex(e => e.DepartmentCode, "UQ__Departme__6EA8896D4A9F22D8").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.DeletedAt).HasColumnType("datetime");
            entity.Property(e => e.DepartmentCode).HasMaxLength(50);
            entity.Property(e => e.DepartmentName).HasMaxLength(150);
            entity.Property(e => e.IsDeleted).HasDefaultValueSql("((0))");
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.Departments)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__Departmen__Delet__3D5E1FD2");
        });

        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Devices__3214EC0792B50178");

            entity.HasIndex(e => e.DeviceCode, "UQ__Devices__AFFB3E95FA254E69").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Barcode).HasMaxLength(100);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DeletedAt).HasColumnType("datetime");
            entity.Property(e => e.DeviceCode).HasMaxLength(50);
            entity.Property(e => e.DeviceImageUrl).HasMaxLength(255);
            entity.Property(e => e.DeviceName).HasMaxLength(100);
            entity.Property(e => e.IsDeleted).HasDefaultValueSql("((0))");
            entity.Property(e => e.PurchaseDate).HasColumnType("date");
            entity.Property(e => e.PurchasePrice)
                .HasDefaultValueSql("((0))")
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SerialNumber).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            entity.Property(e => e.WarrantyExpiry).HasColumnType("date");
            entity.Property(e => e.WarrantyProvider).HasMaxLength(150);

            entity.HasOne(d => d.CurrentDepartment).WithMany(p => p.Devices)
                .HasForeignKey(d => d.CurrentDepartmentId)
                .HasConstraintName("FK__Devices__Current__3A81B327");

            entity.HasOne(d => d.CurrentUser).WithMany(p => p.DeviceCurrentUsers)
                .HasForeignKey(d => d.CurrentUserId)
                .HasConstraintName("FK__Devices__Current__3B75D760");

            entity.HasOne(d => d.Model).WithMany(p => p.Devices)
                .HasForeignKey(d => d.ModelId)
                .HasConstraintName("FK__Devices__ModelId__38996AB5");

            entity.HasOne(d => d.Supplier).WithMany(p => p.Devices)
                .HasForeignKey(d => d.SupplierId)
                .HasConstraintName("FK__Devices__Supplie__398D8EEE");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.DeviceUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK__Devices__Updated__3C69FB99");
        });

        modelBuilder.Entity<DeviceAssignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DeviceAs__3214EC07E23AE668");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.AssignedDate).HasColumnType("date");
            entity.Property(e => e.Note).HasMaxLength(255);
            entity.Property(e => e.ReturnedDate).HasColumnType("date");

            entity.HasOne(d => d.AssignedToDepartment).WithMany(p => p.DeviceAssignments)
                .HasForeignKey(d => d.AssignedToDepartmentId)
                .HasConstraintName("FK__DeviceAss__Assig__44FF419A");

            entity.HasOne(d => d.AssignedToUser).WithMany(p => p.DeviceAssignments)
                .HasForeignKey(d => d.AssignedToUserId)
                .HasConstraintName("FK__DeviceAss__Assig__440B1D61");

            entity.HasOne(d => d.Device).WithMany(p => p.DeviceAssignments)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__DeviceAss__Devic__4316F928");
        });

        modelBuilder.Entity<DeviceHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DeviceHi__3214EC070FB087A7");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.ActionDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.ActionByNavigation).WithMany(p => p.DeviceHistories)
                .HasForeignKey(d => d.ActionBy)
                .HasConstraintName("FK__DeviceHis__Actio__5EBF139D");

            entity.HasOne(d => d.Device).WithMany(p => p.DeviceHistories)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__DeviceHis__Devic__5DCAEF64");
        });

        modelBuilder.Entity<DeviceModel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DeviceMo__3214EC07CED0F119");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.DeletedAt).HasColumnType("datetime");
            entity.Property(e => e.IsDeleted).HasDefaultValueSql("((0))");
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.ModelName).HasMaxLength(150);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.DeviceModelDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__DeviceMod__Delet__403A8C7D");

            entity.HasOne(d => d.DeviceType).WithMany(p => p.DeviceModels)
                .HasForeignKey(d => d.DeviceTypeId)
                .HasConstraintName("FK__DeviceMod__Devic__31EC6D26");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.DeviceModelUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK__DeviceMod__Updat__3F466844");
        });

        modelBuilder.Entity<DeviceStatusLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DeviceSt__3214EC0714BE7117");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ChangedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NewStatus).HasMaxLength(100);
            entity.Property(e => e.OldStatus).HasMaxLength(100);

            entity.HasOne(d => d.ChangedByNavigation).WithMany(p => p.DeviceStatusLogs)
                .HasForeignKey(d => d.ChangedBy)
                .HasConstraintName("FK__DeviceSta__Chang__778AC167");

            entity.HasOne(d => d.Device).WithMany(p => p.DeviceStatusLogs)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__DeviceSta__Devic__76969D2E");
        });

        modelBuilder.Entity<DeviceType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DeviceTy__3214EC0721C80881");

            entity.HasIndex(e => e.TypeName, "UQ__DeviceTy__D4E7DFA82A395CD1").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.TypeName).HasMaxLength(100);
        });

        modelBuilder.Entity<IncidentReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Incident__3214EC07ADDFD2E3");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ImageUrl).HasMaxLength(255);
            entity.Property(e => e.RejectedAt).HasColumnType("datetime");
            entity.Property(e => e.RejectedReason).HasMaxLength(500);
            entity.Property(e => e.ReportDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ReportType).HasMaxLength(50);

            entity.HasOne(d => d.Device).WithMany(p => p.IncidentReports)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__IncidentR__Devic__49C3F6B7");

            entity.HasOne(d => d.RejectedByNavigation).WithMany(p => p.IncidentReportRejectedByNavigations)
                .HasForeignKey(d => d.RejectedBy)
                .HasConstraintName("FK__IncidentR__Rejec__4BAC3F29");

            entity.HasOne(d => d.ReportedByUser).WithMany(p => p.IncidentReportReportedByUsers)
                .HasForeignKey(d => d.ReportedByUserId)
                .HasConstraintName("FK__IncidentR__Repor__4AB81AF0");
        });

        modelBuilder.Entity<Liquidation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Liquidat__3214EC07D1780218");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.LiquidationDate).HasColumnType("date");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.Liquidations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__Liquidati__Appro__59FA5E80");

            entity.HasOne(d => d.Device).WithMany(p => p.Liquidations)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__Liquidati__Devic__59063A47");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notifica__3214EC07F06D090A");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValueSql("((0))");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__UserI__6383C8BA");
        });

        modelBuilder.Entity<Repair>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Repairs__3214EC077E3E8938");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Cost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.LaborHours)
                .HasDefaultValueSql("((0))")
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.RejectedAt).HasColumnType("datetime");
            entity.Property(e => e.RejectedReason).HasMaxLength(500);
            entity.Property(e => e.RepairCompany).HasMaxLength(255);
            entity.Property(e => e.RepairDate).HasColumnType("date");

            entity.HasOne(d => d.Device).WithMany(p => p.Repairs)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("FK__Repairs__DeviceI__5070F446");

            entity.HasOne(d => d.IncidentReport).WithMany(p => p.Repairs)
                .HasForeignKey(d => d.IncidentReportId)
                .HasConstraintName("FK__Repairs__Inciden__5165187F");

            entity.HasOne(d => d.RejectedByNavigation).WithMany(p => p.Repairs)
                .HasForeignKey(d => d.RejectedBy)
                .HasConstraintName("FK__Repairs__Rejecte__52593CB8");
        });

        modelBuilder.Entity<RepairFeedback>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RepairFe__3214EC0761203305");

            entity.ToTable("RepairFeedback");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.RepairFeedbacks)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__RepairFee__Creat__72C60C4A");

            entity.HasOne(d => d.Repair).WithMany(p => p.RepairFeedbacks)
                .HasForeignKey(d => d.RepairId)
                .HasConstraintName("FK__RepairFee__Repai__71D1E811");
        });

        modelBuilder.Entity<RepairImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RepairIm__3214EC079125F113");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ImageUrl).HasMaxLength(255);
            entity.Property(e => e.IsAfterRepair).HasDefaultValueSql("((0))");
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Repair).WithMany(p => p.RepairImages)
                .HasForeignKey(d => d.RepairId)
                .HasConstraintName("FK__RepairIma__Repai__6C190EBB");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.RepairImages)
                .HasForeignKey(d => d.UploadedBy)
                .HasConstraintName("FK__RepairIma__Uploa__6D0D32F4");
        });

        modelBuilder.Entity<Replacement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Replacem__3214EC07731C4418");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ReplacementDate).HasColumnType("date");

            entity.HasOne(d => d.NewDevice).WithMany(p => p.ReplacementNewDevices)
                .HasForeignKey(d => d.NewDeviceId)
                .HasConstraintName("FK__Replaceme__NewDe__5629CD9C");

            entity.HasOne(d => d.OldDevice).WithMany(p => p.ReplacementOldDevices)
                .HasForeignKey(d => d.OldDeviceId)
                .HasConstraintName("FK__Replaceme__OldDe__5535A963");
        });

        modelBuilder.Entity<ReportExport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ReportEx__3214EC077623BF99");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ExportDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FileUrl).HasMaxLength(255);
            entity.Property(e => e.ReportType).HasMaxLength(50);

            entity.HasOne(d => d.ExportedByNavigation).WithMany(p => p.ReportExports)
                .HasForeignKey(d => d.ExportedBy)
                .HasConstraintName("FK__ReportExp__Expor__6754599E");
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Supplier__3214EC07D8C72F35");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.ContactPerson).HasMaxLength(100);
            entity.Property(e => e.DeletedAt).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.IsDeleted).HasDefaultValueSql("((0))");
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.SupplierName).HasMaxLength(150);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.Suppliers)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__Suppliers__Delet__3E52440B");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07B39D4626");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534235D947A").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DeletedAt).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");
            entity.Property(e => e.IsDeleted).HasDefaultValueSql("((0))");
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Position).HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(20);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Department).WithMany(p => p.Users)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("FK__Users__Departmen__2E1BDC42");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
