import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Caregivers_Level_2_Mental_Health_Support_Nigeria.md';

interface Lesson {
  title: string;
  slug: string;
  content: string;
  sort_order: number;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
  sort_order: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

async function uploadCourse() {
  console.log('🚀 Starting Mental Health course ingestion (Surgical Patch Run)...');
  if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // SURGICAL PATCH: Add missing Lesson 3.1 header specifically in Module 3 section
  // Module 3 is at line ~1604. 
  const module3Header = '## Module 3: Behavioral Support';
  if (content.includes(module3Header) && !content.includes('## Lesson 3.1')) {
      console.log('🛠️ Applying surgical patch for Lesson 3.1...');
      const parts = content.split(module3Header);
      // parts[1] is everything after Module 3 header
      // We inject after the first '### Module Introduction' found in parts[1]
      parts[1] = parts[1].replace('### Module Introduction', '### Module Introduction\n\n## Lesson 3.1: Understanding and Managing Aggression');
      content = parts.join(module3Header);
  }

  const courseTitle = 'NIC Certified Caregiver – Level 2: Mental Health & Psychosocial Support';
  const courseSlug = 'nic-level2-mental-health-support';
  const courseDescription = 'Advanced non-clinical mental health care training for NIC Level 1 graduates and experienced caregivers in Nigeria.';

  // 1. Extract Modules
  const modules: Module[] = [];
  const moduleRegex = /^#{1,2} Module (\d+): (?!Introduction|Assessment)(.*)$/gm;
  let moduleMatch;
  const moduleStartIndices: number[] = [];
  const moduleTitles: string[] = [];

  while ((moduleMatch = moduleRegex.exec(content)) !== null) {
    moduleStartIndices.push(moduleMatch.index);
    moduleTitles.push(moduleMatch[2].trim());
  }

  for (let i = 0; i < moduleStartIndices.length; i++) {
    const start = moduleStartIndices[i];
    const end = moduleStartIndices[i + 1] || content.length;
    const moduleContent = content.substring(start, end);
    
    const currentModule: Module = {
      title: `Module ${i + 1}: ${moduleTitles[i]}`,
      description: '',
      lessons: [],
      sort_order: i + 1,
    };

    // Extract lessons
    const lessonRegex = /^## Lesson (\d+\.\d+)[: ]+(.*)$/gm;
    let lessonMatch;
    const lessonStartIndices: number[] = [];
    const lessonTitles: string[] = [];

    while ((lessonMatch = lessonRegex.exec(moduleContent)) !== null) {
        lessonStartIndices.push(lessonMatch.index);
        lessonTitles.push(lessonMatch[2].trim());
    }

    if (lessonStartIndices.length > 0) {
        currentModule.description = moduleContent.substring(0, lessonStartIndices[0]).replace(/^#+ Module \d+: .*$/m, '').trim();
    }

    for (let j = 0; j < lessonStartIndices.length; j++) {
        const lStart = lessonStartIndices[j];
        const lEnd = lessonStartIndices[j + 1] || moduleContent.length;
        let lessonBody = moduleContent.substring(lStart, lEnd);

        // Cleanup
        lessonBody = lessonBody.split(/^##? Module \d+ Assessment/m)[0];
        lessonBody = lessonBody.split(/^##? Section/m)[0];

        const lessonTitle = lessonTitles[j];
        currentModule.lessons.push({
            title: lessonTitle,
            slug: slugify(lessonTitle),
            content: lessonBody.replace(/^## Lesson \d+\.\d+: .*$/m, '').trim(),
            sort_order: j + 1
        });
    }
    modules.push(currentModule);
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  console.log(`📊 Parsing Stats: Modules: ${modules.length}, Total Lessons: ${totalLessons}`);

  // STRICT VALIDATION: Every module must have exactly 5 lessons in this curriculum
  const isPerfect = modules.length === 6 && modules.every(m => m.lessons.length === 5);

  if (!isPerfect) {
      console.error('❌ Validation Failed: Expected 6 modules with 5 lessons each.');
      modules.forEach((m) => {
          console.log(`- ${m.title}: ${m.lessons.length} lessons`);
      });
      return;
  }

  console.log('✅ Validation Passed. Beginning upload...');

  try {
    // 1. Delete existing course if any
    await supabase.from('courses').delete().eq('slug', courseSlug);

    // 2. Upsert Course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .upsert({
        title: courseTitle,
        slug: courseSlug,
        description: courseDescription,
        level: 'Level 2: Specialized',
        price: 150000,
        duration_hours: 45,
        is_published: true,
        sort_order: 4,
        thumbnail_url: 'https://fyaeabdaxqrdosdksqwx.supabase.co/storage/v1/object/public/course-resources/course-banners/fundamentals-banner.png'
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (courseError) throw courseError;
    const courseId = courseData.id;

    // 3. Process Modules
    for (const mod of modules) {
      const { data: newMod, error: insertError } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: mod.title,
          description: mod.description,
          sort_order: mod.sort_order,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      const moduleId = newMod.id;

      // 4. Process Lessons
      const lessonsToInsert = mod.lessons.map(l => ({
          module_id: moduleId,
          title: l.title,
          slug: l.slug,
          content: l.content,
          sort_order: l.sort_order
      }));
      
      const { error: lessonError } = await supabase.from('lessons').insert(lessonsToInsert);
      if (lessonError) throw lessonError;
      
      console.log(`✅ Ingested: ${mod.title} (${mod.lessons.length} lessons)`);
    }

    console.log('🎉 Course Ingestion Successfully Completed!');
  } catch (err) {
    console.error('❌ Ingestion failed:', err);
  }
}

uploadCourse();
