const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedAdminUser() {
  try {
    console.log('🌱 Starting to seed admin user...')

    // Hash the password
    const password = 'admin123'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Admin user data
    const adminUser = {
      email: 'faizanrasheed169@gmail.com',
      password_hash: passwordHash,
      username: 'faizan_admin',
      full_name: 'Faizan Rasheed',
      role: 'admin',
      is_active: true,
      is_verified: true
    }

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', adminUser.email)
      .single()

    if (existingUser) {
      console.log('✅ Admin user already exists:', adminUser.email)
      return
    }

    // Insert admin user
    const { data, error } = await supabase
      .from('users')
      .insert(adminUser)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating admin user:', error)
      throw error
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('👤 Username:', adminUser.username)
    console.log('🔑 Password:', password)
    console.log('🆔 User ID:', data.id)

    // Create user preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: data.id,
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
        push_notifications: true
      })

    if (prefError) {
      console.warn('⚠️ Warning: Could not create user preferences:', prefError.message)
    } else {
      console.log('✅ User preferences created')
    }

    // Log the activity
    const { error: logError } = await supabase.rpc('log_user_activity', {
      user_uuid: data.id,
      action_text: 'admin_user_created',
      resource_type_name: 'user',
      resource_uuid: data.id,
      metadata_json: { seeded: true, role: 'admin' }
    })

    if (logError) {
      console.warn('⚠️ Warning: Could not log activity:', logError.message)
    } else {
      console.log('✅ Activity logged')
    }

    console.log('\n🎉 Admin user seeding completed successfully!')

  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message)
    process.exit(1)
  }
}

// Run the seed function
seedAdminUser()
