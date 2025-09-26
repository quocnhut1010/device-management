-- Fix IncidentReports table - Add missing columns
-- Run this in SQL Server Management Studio or similar tool

USE [YourDatabaseName] -- Replace with your actual database name
GO

-- Check if columns exist first
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'IncidentReports' AND COLUMN_NAME = 'UpdatedAt')
BEGIN
    ALTER TABLE IncidentReports ADD UpdatedAt DATETIME2 NULL
    PRINT 'Added UpdatedAt column to IncidentReports table'
END
ELSE
BEGIN
    PRINT 'UpdatedAt column already exists'
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'IncidentReports' AND COLUMN_NAME = 'UpdatedBy')
BEGIN
    ALTER TABLE IncidentReports ADD UpdatedBy NVARCHAR(450) NULL
    PRINT 'Added UpdatedBy column to IncidentReports table'
END
ELSE
BEGIN
    PRINT 'UpdatedBy column already exists'
END

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'IncidentReports'
ORDER BY ORDINAL_POSITION;

PRINT 'IncidentReports table structure updated successfully!'