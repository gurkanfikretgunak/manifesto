-- Add privacy_consent column to signatures table
ALTER TABLE signatures 
ADD COLUMN privacy_consent BOOLEAN NOT NULL DEFAULT true;

-- Add comment to the column
COMMENT ON COLUMN signatures.privacy_consent IS 'User consent for public display of their signature information (GDPR compliance)';

-- Create index for privacy consent queries if needed
CREATE INDEX IF NOT EXISTS idx_signatures_privacy_consent ON signatures(privacy_consent);
