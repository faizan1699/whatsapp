-- Seed Admin User Script
-- Run this in Supabase SQL Editor or via psql with service role

-- Disable RLS temporarily for seeding
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs DISABLE ROW LEVEL SECURITY;

-- Insert admin user (password: admin123)
INSERT INTO users (
    id,
    email,
    password_hash,
    username,
    full_name,
    role,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'faizanrasheed169@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsJq3M6JW', -- bcrypt hash of 'admin123'
    'faizan_admin',
    'Faizan Rasheed',
    'admin',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID for preferences
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'faizanrasheed169@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert user preferences
        INSERT INTO user_preferences (
            user_id,
            theme,
            language,
            notifications_enabled,
            email_notifications,
            push_notifications,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'dark',
            'en',
            true,
            true,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;

        -- Log the activity
        INSERT INTO user_activity_logs (
            user_id,
            action,
            resource_type,
            resource_id,
            metadata,
            created_at
        ) VALUES (
            admin_user_id,
            'admin_user_created',
            'user',
            admin_user_id,
            '{"seeded": true, "role": "admin"}',
            NOW()
        );

        RAISE NOTICE '✅ Admin user created successfully!';
        RAISE NOTICE '📧 Email: faizanrasheed169@gmail.com';
        RAISE NOTICE '👤 Username: faizan_admin';
        RAISE NOTICE '🔑 Password: admin123';
        RAISE NOTICE '🆔 User ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'ℹ️ Admin user already exists or could not be created';
    END IF;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
