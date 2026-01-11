-- ============================================
-- Migration: Add is_featured column to services table
-- Date: January 11, 2026
-- Description: Add boolean column to mark featured/best services for carousel display
-- ============================================

-- Step 1: Add the is_featured column (defaults to false for existing rows)
ALTER TABLE services
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Step 2: Add a comment to document the column
COMMENT ON COLUMN services.is_featured IS 'Flag to mark featured/best services for home screen carousel';

-- Step 3 (Optional): Mark some initial services as featured
-- Uncomment and modify the service IDs below to set featured services:

-- UPDATE services 
-- SET is_featured = true 
-- WHERE id IN (
--   'your-service-id-1',
--   'your-service-id-2',
--   'your-service-id-3'
-- );

-- Step 4 (Optional): Create an index if you'll frequently query by is_featured
-- CREATE INDEX idx_services_is_featured ON services(is_featured) WHERE is_featured = true;

-- ============================================
-- Rollback (if needed):
-- ALTER TABLE services DROP COLUMN is_featured;
-- ============================================
