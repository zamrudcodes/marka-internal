const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying avatar storage bucket migration...');
  
  try {
    // Create the avatars bucket
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ Bucket "avatars" already exists');
      } else {
        console.error('Error creating bucket:', bucketError);
        throw bucketError;
      }
    } else {
      console.log('✓ Created bucket "avatars"');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. The avatar upload feature is now ready to use');
    console.log('2. Navigate to an employee detail page');
    console.log('3. Click on the avatar to upload a new image');
    console.log('4. Supported formats: JPEG, PNG, WebP (max 5MB)');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();