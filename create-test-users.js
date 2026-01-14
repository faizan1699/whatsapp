const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUsers() {
  const testUsers = [
    {
      email: 'user1@test.com',
      password: 'password123',
      full_name: 'Ahmed Khan',
      username: 'ahmedk'
    },
    {
      email: 'user2@test.com', 
      password: 'password123',
      full_name: 'Fatima Ali',
      username: 'fatimaa'
    },
    {
      email: 'user3@test.com',
      password: 'password123', 
      full_name: 'Omar Hassan',
      username: 'omarh'
    }
  ];

  console.log('Creating test users...');

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          username: user.username
        }
      });

      if (authError) {
        console.error(`Error creating ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created user: ${user.email} (${user.full_name})`);
      
      // Profile automatically created by trigger or we can create manually
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: user.username,
          full_name: user.full_name,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      }

    } catch (error) {
      console.error(`Error with ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Test users created successfully!');
  console.log('You can now login with:');
  testUsers.forEach(user => {
    console.log(`  📧 ${user.email} | 🔑 password123`);
  });
}

createTestUsers().catch(console.error);
