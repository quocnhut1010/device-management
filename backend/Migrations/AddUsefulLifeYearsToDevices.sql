-- Migration: Add UsefulLifeYears column to Devices table
-- Description: Thêm cột UsefulLifeYears (tuổi thọ hữu ích) vào bảng Devices để hỗ trợ tính toán khấu hao

-- Add column UsefulLifeYears (nullable INT)
ALTER TABLE [dbo].[Devices]
ADD [UsefulLifeYears] INT NULL;
GO

-- Optional: Update existing devices with PurchasePrice and PurchaseDate to have a default useful life
-- Uncomment the following if you want to set a default value (e.g., 5 years) for existing devices
/*
UPDATE [dbo].[Devices]
SET [UsefulLifeYears] = 5
WHERE [PurchasePrice] IS NOT NULL 
  AND [PurchaseDate] IS NOT NULL 
  AND [UsefulLifeYears] IS NULL
  AND [IsDeleted] = 0;
GO
*/

