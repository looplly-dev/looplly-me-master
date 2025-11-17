-- Add status field to documentation table
ALTER TABLE documentation 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
CHECK (status IN ('draft', 'published', 'coming_soon'));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_documentation_status ON documentation(status);

-- Update existing records to 'draft' if any exist
UPDATE documentation SET status = 'draft' WHERE status IS NULL;