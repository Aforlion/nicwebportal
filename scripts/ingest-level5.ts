import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_LEVEL5_Curriculum_Complete_Final.md';

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
  console.log('🚀 Starting Level 5 execution & ingestion (FINAL COMPLETE)...');
  if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const courseId = '52e1fde0-a8b2-4d56-b9a3-a75d27d7f8a5';
  const newCourseTitle = 'NIC Care Business & Agency Development Program (Level 5)';
  const courseSlug = 'nic-care-business-agency-development-program-level-5';
  const price = 350000;

  // 1. Extract Modules and Lessons using a Map to handle duplicates
  const moduleMap = new Map<number, Module>();
  const lines = content.split('\n');
  
  let currentModule: Module | null = null;
  let currentLesson: Lesson | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const moduleMatch = line.match(/^## 🟠 MODULE (\d+): (.*)$/i) || line.match(/^## MODULE (\d+): (.*)$/i);
    const lessonMatch = line.match(/^### Lesson (\d+\.\d+) – (.*)$/i) || line.match(/^### Lesson (\d+) – (.*)$/i);
    const assessmentMatch = line.match(/^### Module (\d+) Assessment/i) || line.match(/^## Module (\d+) Assessment/i) || line.match(/^### Module Assessment/i);

    if (moduleMatch) {
      // Save previous lesson if any
      if (currentLesson && currentModule) {
        currentLesson.content = currentContent.join('\n').trim();
        currentModule.lessons.push({ ...currentLesson });
        currentLesson = null;
        currentContent = [];
      }

      const modNum = parseInt(moduleMatch[1]);
      let modTitle = moduleMatch[2].trim();
      const fullModTitle = `Module ${modNum}: ${modTitle}`;

      // Always create a new entry or reset if duplicate (duplicates in this file are typically outlines followed by full content)
      const newMod: Module = {
        title: fullModTitle,
        description: '',
        lessons: [],
        sort_order: modNum
      };
      moduleMap.set(modNum, newMod);
      currentModule = newMod;
      continue;
    }

    if (lessonMatch) {
      // Save previous lesson if any
      if (currentLesson && currentModule) {
        currentLesson.content = currentContent.join('\n').trim();
        currentModule.lessons.push({ ...currentLesson });
        currentContent = [];
      }

      if (currentModule) {
        const lessonTitle = lessonMatch[2].trim();
        currentLesson = {
          title: lessonTitle,
          slug: slugify(lessonTitle),
          content: '',
          sort_order: 0 // Will adjust globally later
        };
        
        currentContent.push(`### ${lessonTitle}`);
      }
      continue;
    }

    if (assessmentMatch) {
        // We treat assessments as the end of a module block for content capture
        if (currentLesson && currentModule) {
            currentLesson.content = currentContent.join('\n').trim();
            currentModule.lessons.push({ ...currentLesson });
            currentLesson = null;
            currentContent = [];
        }
        continue;
    }

    // Capture lesson contents
    if (currentLesson) {
      currentContent.push(line);
    } 
  }

  // Final push
  if (currentLesson && currentModule) {
    currentLesson.content = currentContent.join('\n').trim();
    currentModule.lessons.push({ ...currentLesson });
  }

  // Convert map to sorted array and adjust lesson sort orders
  const sortedModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  let globalLessonCount = 0;
  for (const mod of sortedModules) {
    for (const lesson of mod.lessons) {
      globalLessonCount++;
      lesson.sort_order = globalLessonCount;
    }
  }

  console.log(`📊 Parsing Stats: Modules Expected: 14, Found: ${sortedModules.length}, Total Lessons: ${globalLessonCount}`);


  if (sortedModules.length === 0) {
     console.error('❌ Failed to parse any modules. Check regex!');
     return;
  }

  try {
    // 1. Create or Update Course
    console.log(`📝 Setting up course record: ${newCourseTitle}`);
    
    // Check if course exists first
    const { data: existingCourse } = await supabase.from('courses').select('id').eq('id', courseId).single();
    
    if (!existingCourse) {
       console.log('Course doesn\'t exist. Creating new record...');
       const { error: insertCourseError } = await supabase.from('courses').insert({
           id: courseId,
           title: newCourseTitle,
           slug: courseSlug,
           description: 'The pinnacle of the NIC Career Pathway. Transform into a visionary entrepreneur, a responsible employer, and a leader shaping the future of professional care in Nigeria.',
           price: price
       });
       if (insertCourseError) throw insertCourseError;
    } else {
       console.log('Course exists. Updating record...');
       const { error: updateCourseError } = await supabase.from('courses').update({
           title: newCourseTitle,
           slug: courseSlug,
           price: price
       }).eq('id', courseId);
       if (updateCourseError) throw updateCourseError;
    }
    
    // 2. Clear old modules (Cascade will handle lessons)
    console.log('🚮 Cleaning up any old modules...');
    const { error: deleteError } = await supabase
      .from('modules')
      .delete()
      .eq('course_id', courseId);
    
    if (deleteError) throw deleteError;

    // 3. Ingest new modules
    for (const mod of sortedModules) {
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

      // 3b. Link to course_modules
      console.log(`🔗 Linking ${mod.title} to course_modules...`);
      const { error: cmError } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          module_id: moduleId,
          sort_order: mod.sort_order
        });
      
      if (cmError) throw cmError;

      // 4. Ingest new lessons
      if (mod.lessons.length > 0) {
          const lessonsToInsert = mod.lessons.map(l => ({
              module_id: moduleId,
              title: l.title,
              slug: l.slug,
              content: l.content,
              sort_order: l.sort_order
          }));
          
          const { error: lessonError } = await supabase.from('lessons').insert(lessonsToInsert);
          if (lessonError) throw lessonError;
      }
      
      console.log(`✅ Ingested: ${mod.title} (${mod.lessons.length} lessons)`);
    }

    console.log('🎉 Level 5 Deployment Successfully Completed!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
  }
}

uploadCourse();
