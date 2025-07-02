-- Convert Snapchat credentials to Instagram credentials
ALTER TABLE chat_sessions 
DROP COLUMN IF EXISTS snapchat_username,
DROP COLUMN IF EXISTS snapchat_password;

ALTER TABLE chat_sessions 
ADD COLUMN instagram_username TEXT,
ADD COLUMN instagram_password TEXT;

-- Create index for Instagram login credentials
CREATE INDEX idx_chat_sessions_instagram_credentials ON chat_sessions(instagram_username);

-- Update RLS policies to allow access to new columns
DROP POLICY IF EXISTS "Allow anonymous access to chat_sessions" ON chat_sessions;
CREATE POLICY "Allow anonymous access to chat_sessions"
    ON chat_sessions FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true); 