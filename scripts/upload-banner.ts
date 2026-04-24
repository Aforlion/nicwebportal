import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'course-resources';
const FOLDER_NAME = 'course-banners';

async function uploadBanner(courseSlug: string, localPath: string) {
  console.log(`🚀 Uploading banner for ${courseSlug}...`);
  
  if (!fs.existsSync(localPath)) {
    console.error(`File not found: ${localPath}`);
    return;
  }

  const fileExt = localPath.split('.').pop();
  const fileName = `${courseSlug}-banner.${fileExt}`;
  const filePath = `${FOLDER_NAME}/${fileName}`;
  const fileBuffer = fs.readFileSync(localPath);

  // 1. Upload to Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      upsert: true
    });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
    return;
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  console.log(`✅ Uploaded to: ${publicUrl}`);

  // 3. Update Course table
  const { error: dbError } = await supabase
    .from('courses')
    .update({ thumbnail_url: publicUrl })
    .eq('slug', courseSlug);

  if (dbError) {
    console.error('❌ Database update failed:', dbError);
    return;
  }

  console.log(`🎉 Banner successfully linked to ${courseSlug}!`);
}

// Get arguments from command line
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx tsx scripts/upload-banner.ts <slug> <localPath>');
} else {
  uploadBanner(args[0], args[1]);
}
