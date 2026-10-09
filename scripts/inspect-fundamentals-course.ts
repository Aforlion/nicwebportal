import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectFullDetails() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      course_modules (
        sort_order,
        modules (
          id,
          title,
          description,
          lessons (
            id,
            title,
            slug,
            sort_order,
            video_url
          )
        )
      )
    `)
    .eq('id', 'd040764a-e8c3-46c4-975d-7802c91fa1d6');

  if (error || !courses || courses.length === 0) {
    console.error('Error fetching course:', error);
    return;
  }

  const course = courses[0];
  const modules = (course.course_modules as any[])
    .map(cm => ({ ...cm.modules, sort_order: cm.sort_order }))
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const m of modules) {
    console.log(`\n==================================================`);
    console.log(`MODULE ${m.sort_order}: ${m.title} (ID: ${m.id})`);
    const lessons = (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    for (const l of lessons) {
      console.log(`   Lesson ${l.sort_order}: [${l.slug}] ${l.title} (ID: ${l.id})`);
    }
  }
}

inspectFullDetails();
