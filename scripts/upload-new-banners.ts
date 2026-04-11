import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const banners = [
    {
        slug: 'fundamentals-of-professional-caregiving',
        localPath: 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\fundamentals_course_banner_1775201871947.png',
        fileName: 'fundamentals-banner.png',
        level: 'Level 1: Foundation',
        sortOrder: 1
    },
    {
        slug: 'nic-level2-home-health-chronic-care',
        // Already has a banner, but I'll update sort order and level
        level: 'Level 2: Specialized',
        sortOrder: 2
    },
    {
        slug: 'nic-certified-caregiver-level-2-elderly-care',
        localPath: 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\elderly_care_gerontology_banner_1775202130503.png',
        fileName: 'elderly-care-banner.png',
        level: 'Level 2: Specialized',
        sortOrder: 3
    },
    {
        slug: 'disability-special-needs-care',
        localPath: 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\disability_special_needs_banner_1775202018185.png',
        fileName: 'disability-care-banner.png',
        level: 'Level 2: Specialized',
        sortOrder: 4
    },
    {
        slug: 'advanced-care-practitioner',
        localPath: 'C:\\Users\\Olatunji\\.gemini\\antigravity\\brain\\683e9870-7a35-4a77-94ed-e35d587680e2\\advanced_practitioner_banner_1775201892331.png',
        fileName: 'advanced-practitioner-banner.png',
        level: 'Level 3: Advanced',
        sortOrder: 5
    },
    {
        slug: 'nic-care-supervisor-facility-manager-level-4',
        // Already has a banner
        level: 'Level 4: Expert',
        sortOrder: 6
    },
    {
        slug: 'nic-caregiver-refresher-competency-update-program',
        // No new banner yet, will use a placeholder or reuse one
        level: 'Professional Update',
        sortOrder: 7
    }
];

const bucketName = 'course-resources';

async function processBanners() {
    for (const banner of banners) {
        console.log(`Processing ${banner.slug}...`);

        let publicUrl = '';

        if (banner.localPath && fs.existsSync(banner.localPath)) {
            const fileBuffer = fs.readFileSync(banner.localPath);
            const storagePath = `course-banners/${banner.fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                });

            if (uploadError) {
                console.error(`Error uploading ${banner.slug}:`, uploadError);
            } else {
                const { data: { publicUrl: url } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(storagePath);
                publicUrl = url;
                console.log(`✅ Uploaded banner for ${banner.slug}: ${publicUrl}`);
            }
        }

        // Update database
        const updateData: any = {
            level: banner.level,
            sort_order: banner.sortOrder
        };

        if (publicUrl) {
            updateData.thumbnail_url = publicUrl;
        }

        const { error: dbError } = await supabase
            .from('courses')
            .update(updateData)
            .eq('slug', banner.slug);

        if (dbError) {
            console.error(`Error updating DB for ${banner.slug}:`, dbError);
        } else {
            console.log(`✅ Updated DB for ${banner.slug}`);
        }
    }
}

processBanners();
