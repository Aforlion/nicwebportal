import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const imagePath = 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\level4_course_banner_1775028342308.png';
const bucketName = 'course-resources';
const fileName = 'course-banners/level4-banner.png';

async function uploadBanner() {
  console.log('Uploading Level 4 course banner...');
  
  const fileBuffer = fs.readFileSync(imagePath);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading banner:', error);
    return;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log('Banner uploaded successfully:', publicUrl);
}

uploadBanner();
