-- Add therapist location tracking columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS therapist_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS therapist_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS therapist_location_updated_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance on location queries
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_location 
ON bookings(therapist_id, therapist_location_updated_at) 
WHERE therapist_latitude IS NOT NULL AND therapist_longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.therapist_latitude IS 'Real-time latitude of therapist during active booking';
COMMENT ON COLUMN bookings.therapist_longitude IS 'Real-time longitude of therapist during active booking';
COMMENT ON COLUMN bookings.therapist_location_updated_at IS 'Last time therapist location was updated';
