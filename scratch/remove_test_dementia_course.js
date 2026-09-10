const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function removeTestCourse() {
  const courseId = 'dbc8a8f5-aacf-4532-a195-e22b812cde4b';
  console.log(`=== UNPUBLISHING AND REMOVING TEST COURSE: ${courseId} ===`);

  // 1. Set is_published to false and update title to indicate archival
  const { data: updated, error: updErr } = await supabase
    .from('courses')
    .update({ 
      is_published: false,
      title: '[ARCHIVED TEST] Dementia'
    })
    .eq('id', courseId)
    .select();

  if (updErr) {
    console.error("Error unpublishing course:", updErr.message);
  } else {
    console.log("Course unpublished successfully:", JSON.stringify(updated, null, 2));
  }

  // Verify that only the official course is published now
  const { data: cpdCourse } = await supabase
    .from('courses')
    .select('id, title, slug, price, is_published')
    .ilike('title', '%Dementia%');

  console.log('\n=== CURRENT DEMENTIA COURSES STATUS ===');
  console.log(JSON.stringify(cpdCourse, null, 2));
}

removeTestCourse().catch(console.error);
