import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const bannerPath = 'C:/Users/Olatunji/.gemini/antigravity/brain/683e9870-7a35-4a77-94ed-e35d587680e2/mental_health_course_banner_1776034396476.png';
const courseSlug = 'nic-level2-mental-health-support';

async function uploadBanner() {
    console.log(`🚀 Uploading banner for ${courseSlug}...`);
    
    if (!fs.existsSync(bannerPath)) {
        console.error('Banner file not found');
        return;
    }

    const fileBuffer = fs.readFileSync(bannerPath);
    const fileName = `mental-health-support-banner.png`;
    const storagePath = `course-banners/${fileName}`;

    // 1. Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (uploadError) {
        console.error('Error uploading banner:', uploadError);
        return;
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/course-resources/${storagePath}`;
    console.log(`✅ Uploaded banner: ${publicUrl}`);

    // 2. Update DB
    const { error: dbError } = await supabase
        .from('courses')
        .update({ thumbnail_url: publicUrl })
        .eq('slug', courseSlug);

    if (dbError) {
        console.error('Error updating DB:', dbError);
        return;
    }

    console.log(`✅ Updated DB for ${courseSlug}`);
    console.log('🎉 Banner upload and database update complete!');
}

uploadBanner();
