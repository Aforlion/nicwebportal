const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectAllCoursesPrices() {
  console.log("=== INSPECTING ALL COURSES AND THEIR PRICES IN DATABASE ===");

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug, price, level, is_published, created_at, updated_at, created_by')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return;
  }

  console.log(`Total courses in database: ${courses?.length}`);
  console.log(JSON.stringify(courses, null, 2));
}

inspectAllCoursesPrices().catch(console.error);
