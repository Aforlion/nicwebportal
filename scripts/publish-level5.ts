import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function publishLevel5() {
  const courseId = '52e1fde0-a8b2-4d56-b9a3-a75d27d7f8a5';
  const imagePath = 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\level5_agency_business_banner_1776380539816.png';
  
  console.log(`🚀 Publishing course: ${courseId}`);

  // 1. Upload Banner if it exists
  let publicUrl = null;
  if (fs.existsSync(imagePath)) {
    const fileName = `course-banners/${courseId}-${randomUUID()}.png`;
    const fileBuffer = fs.readFileSync(imagePath);
    
    console.log(`📤 Uploading banner to course-resources/${fileName}...`);
    const { data, error: uploadError } = await supabase.storage
      .from('course-resources')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
    } else {
      const { data: urlData } = supabase.storage
        .from('course-resources')
        .getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
      console.log(`✅ Banner uploaded: ${publicUrl}`);
    }
  } else {
    console.warn(`⚠️ Banner not found at ${imagePath}. Skipping upload.`);
  }

  // 2. Update Course Record
  console.log(`📝 Updating course record...`);
  const updateData: any = {
    is_published: true,
    level: 'Advanced Entrepreneurship (Level 5)',
    description: 'Transform your care career into a thriving business. Master agency logistics, financial management, and leadership strategies to shape the future of professional care in Nigeria.',
    sort_order: 5 // Ensure it appears at the right place
  };

  if (publicUrl) {
    updateData.thumbnail_url = publicUrl;
  }

  const { error: dbError } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', courseId);
    
  if (dbError) {
    console.error('❌ Database update failed:', dbError);
    return;
  }

  console.log('🎉 Course published and updated successfully!');
}

publishLevel5();
