const { createClient } = '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Sample users data
const sampleUsers = [
  {
    email: 'admin@chatapp.com',
    password: 'admin123',
    full_name: 'Admin User',
    username: 'admin',
    phone: '+1234567890',
    role: 'admin',
    is_active: true,
    is_verified: true
  },
  {
    email: 'john.doe@chatapp.com',
    password: 'password123',
    full_name: 'John Doe',
    username: 'johndoe',
    phone: '+1234567891',
    role: 'user',
    is_active: true,
    is_verified: true
  },
  {
    email: 'jane.smith@chatapp.com',
    password: 'password123',
    full_name: 'Jane Smith',
    username: 'janesmith',
    phone: '+1234567892',
    role: 'user',
    is_active: true,
    is_verified: true
  },
  {
    email: 'mike.wilson@chatapp.com',
    password: 'password123',
    full_name: 'Mike Wilson',
    username: 'mikewilson',
    phone: '+1234567893',
    role: 'user',
    is_active: true,
    is_verified: true
  },
  {
    email: 'sarah.jones@chatapp.com',
    password: 'password123',
    full_name: 'Sarah Jones',
    username: 'sarahjones',
    phone: '+1234567894',
    role: 'user',
    is_active: true,
    is_verified: true
  },
  {
    email: 'david.brown@chatapp.com',
    password: 'password123',
    full_name: 'David Brown',
    username: 'davidbrown',
    phone: '+1234567895',
    role: 'user',
    is_active: true,
    is_verified: true
  }
]

async function seedUsers() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Clear existing users
    console.log('🗑️ Clearing existing users...')
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('role', 'admin') // Don't delete admin users
    
    if (deleteError) {
      console.error('❌ Error clearing users:', deleteError)
      return
    }
    
    console.log('✅ Existing users cleared')
    
    // Insert sample users
    console.log('📝 Inserting sample users...')
    
    for (const user of sampleUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          username: user.username
        }
      })
      
      if (authError) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError)
        continue
      }
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          username: user.username,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          is_verified: user.is_verified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError)
        continue
      }
      
      console.log(`✅ Created user: ${user.full_name} (${user.username})`)
    }
    
    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Sample Users Created:')
    console.log('├── admin@chatapp.com (admin)')
    console.log('├── john.doe@chatapp.com (user)')
    console.log('├── jane.smith@chatapp.com (user)')
    console.log('├── mike.wilson@chatapp.com (user)')
    console.log('└── sarah.jones@chatapp.com (user)')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedUsers()
}

module.exports = { seedUsers }
