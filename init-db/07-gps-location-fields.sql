-- Add GPS location fields to systems table
-- Migration script to add POINT geometry, department and town fields

-- Drop old gps_location text column (ignore error if it doesn't exist)
ALTER TABLE systems DROP COLUMN gps_location;

-- Add new columns
ALTER TABLE systems 
  ADD COLUMN gps_location POINT DEFAULT NULL,
  ADD COLUMN dept_no VARCHAR(5) DEFAULT NULL,
  ADD COLUMN town VARCHAR(255) DEFAULT NULL;
