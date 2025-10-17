-- Add ActionType column to DeviceHistory table if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'DeviceHistories' 
    AND COLUMN_NAME = 'ActionType'
)
BEGIN
    ALTER TABLE DeviceHistories ADD ActionType nvarchar(50) NULL;
    
    -- Update existing records with default ActionType
    UPDATE DeviceHistories SET ActionType = 'SYSTEM' WHERE ActionType IS NULL;
END

-- Also ensure the table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DeviceHistories')
BEGIN
    PRINT 'DeviceHistories table does not exist!'
END