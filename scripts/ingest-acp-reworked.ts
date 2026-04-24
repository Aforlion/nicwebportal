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

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Advanced_Care_Practitioner_Full_Course_Reworked.md';

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
  console.log('🚀 Starting ACP Rework course ingestion...');
  if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const courseId = 'b505a8b1-c40b-47ba-9eac-c42ed035e4d6';
  const newCourseTitle = 'NIC Advanced Care Practitioner (ACP) Program';
  const courseSlug = 'advanced-care-practitioner';

  // 1. Extract Modules and Lessons using a stateful approach
  const modules: Module[] = [];
  const lines = content.split('\n');
  
  let currentModule: Module | null = null;
  let currentLesson: Lesson | null = null;
  let currentContent: string[] = [];
  let currentModuleIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const moduleMatch = line.match(/^# Module (\d+): (.*)$/);
    const lessonMatch = line.match(/^## Lesson (\d+): (.*)$/);
    const assessmentMatch = line.match(/^# Module (\d+) Assessment: (.*)$/);

    if (moduleMatch) {
      // Save current lesson if exists
      if (currentLesson && currentModule) {
        currentLesson.content = currentContent.join('\n').trim();
        currentModule.lessons.push({ ...currentLesson });
        currentLesson = null;
        currentContent = [];
      }

      const modNum = parseInt(moduleMatch[1]);
      const modTitle = moduleMatch[2].trim();
      const fullModTitle = `Module ${modNum}: ${modTitle}`;

      // Check if this module already exists (since the file repeats headers)
      let existingMod = modules.find(m => m.sort_order === modNum);
      if (!existingMod) {
        existingMod = {
          title: fullModTitle,
          description: '',
          lessons: [],
          sort_order: modNum
        };
        modules.push(existingMod);
      }
      currentModule = existingMod;
      continue;
    }

    if (lessonMatch) {
      // Save current lesson if exists
      if (currentLesson && currentModule) {
        currentLesson.content = currentContent.join('\n').trim();
        currentModule.lessons.push({ ...currentLesson });
        currentContent = [];
      }

      const lessonNum = parseInt(lessonMatch[1]);
      const lessonTitle = lessonMatch[2].trim();
      currentLesson = {
        title: lessonTitle,
        slug: slugify(lessonTitle),
        content: '',
        sort_order: lessonNum
      };
      continue;
    }

    if (assessmentMatch) {
        // Stop current lesson parsing when assessment starts
        if (currentLesson && currentModule) {
            currentLesson.content = currentContent.join('\n').trim();
            currentModule.lessons.push({ ...currentLesson });
            currentLesson = null;
            currentContent = [];
        }
        continue;
    }

    if (currentLesson) {
      currentContent.push(line);
    } else if (currentModule && currentContent.length === 0 && !line.startsWith('#')) {
        // Optionally capture module description here if needed
    }
  }

  // Final push
  if (currentLesson && currentModule) {
    currentLesson.content = currentContent.join('\n').trim();
    currentModule.lessons.push({ ...currentLesson });
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  console.log(`📊 Parsing Stats: Modules: ${modules.length}, Total Lessons: ${totalLessons}`);

  // STRICT VALIDATION
  const isPerfect = modules.length === 6 && modules.every(m => m.lessons.length === 5);

  if (!isPerfect) {
      console.error('❌ Validation Failed: Expected 6 modules with 5 lessons each.');
      modules.forEach((m) => {
          console.log(`- ${m.title}: ${m.lessons.length} lessons`);
      });
      return;
  }

  console.log('✅ Validation Passed. Beginning Database update...');

  try {
    // 1. Update Course Title
    const { error: updateError } = await supabase
      .from('courses')
      .update({ title: newCourseTitle })
      .eq('id', courseId);
    
    if (updateError) throw updateError;
    console.log(`✅ Course title updated to: ${newCourseTitle}`);

    // 2. Clear old modules (Cascade will handle lessons)
    console.log('🚮 Cleaning up old content...');
    const { error: deleteError } = await supabase
      .from('modules')
      .delete()
      .eq('course_id', courseId);
    
    if (deleteError) throw deleteError;

    // 3. Ingest new modules
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

      // 4. Ingest new lessons
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

    console.log('🎉 ACP Rework Successfully Deployed!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
  }
}

uploadCourse();
