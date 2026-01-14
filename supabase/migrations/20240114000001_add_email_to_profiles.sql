-- Add email column to profiles table by joining with auth.users
-- First, add the email column to profiles table
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Update email column by joining with auth.users
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Create a unique index on email if needed
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
