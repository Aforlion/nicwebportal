const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3OTk4MiwiZXhwIjoyMDgzOTU1OTgyfQ.6Zcb4njTJ26Z3pcfywlHJonbESQd0MmKA0EUxAH6TkU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("=== Seeding CPD Courses into Supabase Database ===");

  const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/cpd_courses.json'), 'utf-8'));

  for (const c of coursesData) {
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', c.slug)
      .maybeSingle();

    const coursePayload = {
      title: c.title,
      slug: c.slug,
      description: c.description,
      price: c.price_ngn,
      duration_hours: c.duration_hours,
      level: c.level,
      is_published: true,
      sort_order: 100 + c.sort_order,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabase
        .from('courses')
        .update(coursePayload)
        .eq('id', existing.id);

      if (error) console.error(`Error updating course ${c.slug}:`, error.message);
      else console.log(`[UPDATED] ${c.title}`);
    } else {
      const { error } = await supabase
        .from('courses')
        .insert({
          ...coursePayload,
          created_at: new Date().toISOString()
        });

      if (error) console.error(`Error inserting course ${c.slug}:`, error.message);
      else console.log(`[INSERTED] ${c.title}`);
    }
  }

  console.log("\n=== Database Seeding Complete! ===");
}

seed().catch(console.error);
