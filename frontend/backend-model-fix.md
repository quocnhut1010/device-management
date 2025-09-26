# Backend Model Fix for IncidentReports

## Option 1: Add columns to database (RECOMMENDED)
Run the SQL script: `fix-incident-table.sql`

## Option 2: Temporarily ignore columns in backend model

### In IncidentReport entity model:
```csharp
[NotMapped] // This tells EF to ignore this property
public string? UpdatedBy { get; set; }

[NotMapped] // This tells EF to ignore this property  
public DateTime? UpdatedAt { get; set; }
```

### Or remove the properties entirely if not needed:
```csharp
// Remove or comment out these lines from IncidentReport model:
// public string? UpdatedBy { get; set; }
// public DateTime? UpdatedAt { get; set; }
```

### In DbContext OnModelCreating method:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Ignore specific properties
    modelBuilder.Entity<IncidentReport>()
        .Ignore(e => e.UpdatedBy)
        .Ignore(e => e.UpdatedAt);
        
    base.OnModelCreating(modelBuilder);
}
```

## Option 3: Use EF Migration (BEST PRACTICE)
```bash
# In backend project directory
dotnet ef migrations add AddUpdatedFieldsToIncidentReport
dotnet ef database update
```

This will automatically generate and run the SQL to add the missing columns.

## Why this happened:
1. Backend model was updated with new fields
2. Database wasn't updated accordingly
3. EF Core tried to use columns that don't exist

## Choose the best option for your project:
- **Production**: Use EF Migration (Option 3)
- **Development**: Run SQL script directly (Option 1)  
- **Quick fix**: Ignore fields temporarily (Option 2)