import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadBanner() {
  const courseId = '2f46a78c-dea1-461b-aa3c-6495e281ec26'; // Geriatrics course ID
  const imagePath = 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\geriatrics_and_gerontology_banner_1776333618834.png';
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    return;
  }

  const fileName = `course-banners/${courseId}-${randomUUID()}.png`;
  const fileBuffer = fs.readFileSync(imagePath);

  console.log(`📤 Uploading to course-banners bucket as ${fileName}...`);
  
  const { data, error: uploadError } = await supabase.storage
    .from('course-resources')
    .upload(fileName, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    return;
  }
  
  console.log('✅ Upload successful:', data);

  const { data: publicUrlData } = supabase.storage
    .from('course-resources')
    .getPublicUrl(fileName);
    
  const publicUrl = publicUrlData.publicUrl;
  console.log(`🌐 Public URL: ${publicUrl}`);

  console.log(`📝 Updating course record ${courseId}...`);
  const { error: dbError } = await supabase
    .from('courses')
    .update({ thumbnail_url: publicUrl })
    .eq('id', courseId);
    
  if (dbError) {
    console.error('❌ Database update failed:', dbError);
    return;
  }

  console.log('🎉 Course updated successfully with the new banner!');
}

uploadBanner();
