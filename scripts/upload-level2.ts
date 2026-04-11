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

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_CERTIFIED_CAREGIVER_LEVEL_2_COURSE.md';

interface Assessment {
  title: string;
  type: string;
  questions: any[];
}

interface Lesson {
  title: string;
  slug: string;
  content: string;
  sort_order: number;
  assessment?: Assessment;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
  sort_order: number;
  assessment?: Assessment; // Module level assessment
}

interface Course {
  title: string;
  slug: string;
  description: string;
  modules: Module[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

function parseAnswers(text: string): Record<number, string> {
  const answers: Record<number, string> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\.\s+([a-d])$/i);
    if (match) {
      answers[parseInt(match[1])] = match[2].toLowerCase();
    }
  }
  return answers;
}

function parseMCQs(mcqText: string, answerText: string): any[] {
  const questions: any[] = [];
  const lines = mcqText.split('\n');
  const answers = parseAnswers(answerText);
  let currentQuestion: any = null;
  let qCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\**\d+\./.test(trimmed)) {
      if (currentQuestion) questions.push(currentQuestion);
      qCount++;
      currentQuestion = {
        question: trimmed.replace(/^\**\d+\.\s*/, '').replace(/\**$/, '').trim(),
        options: [],
        answer: answers[qCount] || '',
      };
    } else if (/^[a-d]\)/i.test(trimmed)) {
      if (currentQuestion) {
        currentQuestion.options.push(trimmed.replace(/^[a-d]\)\s*/i, '').trim());
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

async function uploadCourse() {
  console.log('Starting Level 2 course upload...');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract Course Title: NIC CERTIFIED CAREGIVER – LEVEL 2: Home Health & Chronic Care
  const courseTitle = 'NIC Certified Caregiver – Level 2: Home Health & Chronic Care';
  const courseSlug = 'nic-level2-home-health-chronic-care';
  
  let course: Course = {
    title: courseTitle,
    slug: courseSlug,
    description: '',
    modules: [],
  };

  // 1. Get Course Description from Introduction
  const introMatch = content.split(/^## Module 1/m)[0];
  course.description = introMatch.replace(/^# .*$/m, '').trim();

  // 2. Split into Modules
  const moduleSplits = content.split(/^## (Module \d+:.*)$/m);
  
  for (let i = 1; i < moduleSplits.length; i += 2) {
    const moduleHeader = moduleSplits[i];
    const moduleFullContent = moduleSplits[i + 1];

    const moduleTitle = moduleHeader.replace(/^Module \d+: /, '').trim();
    const currentModule: Module = {
      title: moduleTitle,
      description: '',
      lessons: [],
      sort_order: Math.ceil(i/2),
    };

    // Split module by Lessons (H3)
    const lessonSplits = moduleFullContent.split(/^### (Lesson \d+\.\d+:.*)$/m);
    
    // Module description is before first lesson
    currentModule.description = lessonSplits[0].trim();

    for (let j = 1; j < lessonSplits.length; j += 2) {
      const lessonHeader = lessonSplits[j];
      let lessonBody = lessonSplits[j + 1];

      const lessonTitle = lessonHeader.replace(/^Lesson \d+\.\d+: /, '').trim();
      
      const currentLesson: Lesson = {
        title: lessonTitle,
        slug: slugify(lessonTitle),
        content: lessonBody.trim(),
        sort_order: Math.ceil(j/2),
      };
      currentModule.lessons.push(currentLesson);
    }

    // Check for Module-level Assessment at the very end of module content
    // Usually after "End of Module X" or just "#### Multiple Choice Questions (MCQs)"
    const mcqIdx = moduleFullContent.indexOf('#### Multiple Choice Questions (MCQs)');
    if (mcqIdx !== -1) {
      const assessmentContent = moduleFullContent.substring(mcqIdx);
      const parts = assessmentContent.split(/#### Answers:/i);
      if (parts.length > 1) {
        const mcqText = parts[0];
        const answerText = parts[1];
        const questions = parseMCQs(mcqText, answerText);
        if (questions.length > 0) {
          currentModule.assessment = {
            title: `${moduleTitle} Assessment`,
            type: 'quiz',
            questions: questions
          };
        }
      }
    }

    course.modules.push(currentModule);
  }

  console.log(`Parsed ${course.modules.length} modules and ${course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons.`);

  try {
    // A. Upsert Course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .upsert({
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: 'Advanced',
        price: 150000,
        duration_hours: 40,
        thumbnail_url: 'https://fyaeabdaxqrdosdksqwx.supabase.co/storage/v1/object/public/gallery/level2_banner.png', // Placeholder for now, will upload later
        is_published: true,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (courseError) throw courseError;
    const courseId = courseData.id;
    console.log(`✅ Course LIVE: ${courseId}`);

    // B. Process Modules
    for (const mod of course.modules) {
      // Check if module exists
      const { data: existingModule } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('title', mod.title)
        .maybeSingle();

      let moduleId: string;
      if (existingModule) {
        const { data: updatedModule, error: updateError } = await supabase
          .from('modules')
          .update({
            description: mod.description,
            sort_order: mod.sort_order,
          })
          .eq('id', existingModule.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        moduleId = updatedModule.id;
      } else {
        const { data: newModule, error: insertError } = await supabase
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
        moduleId = newModule.id;
      }

      // C. Process Lessons
      for (const lesson of mod.lessons) {
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .upsert({
            module_id: moduleId,
            title: lesson.title,
            slug: lesson.slug,
            content: lesson.content,
            sort_order: lesson.sort_order,
          }, { onConflict: 'module_id, slug' })
          .select()
          .single();

        if (lessonError) {
          console.error(`Error uploading lesson ${lesson.title}:`, lessonError);
          continue;
        }
      }

      // D. Process Module Assessment (as a special lesson at the end of the module)
      if (mod.assessment) {
        const assessmentSlug = slugify(mod.assessment.title);
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .upsert({
            module_id: moduleId,
            title: mod.assessment.title,
            slug: assessmentSlug,
            content: 'Complete this assessment to verify your mastery of the module content.',
            sort_order: mod.lessons.length + 1,
          }, { onConflict: 'module_id, slug' })
          .select()
          .single();

        if (!lessonError) {
          await supabase
            .from('assessments')
            .upsert({
              lesson_id: lessonData.id,
              title: mod.assessment.title,
              type: mod.assessment.type,
              questions: mod.assessment.questions,
              passing_score: 70,
            }, { onConflict: 'lesson_id' });
        }
      }
      console.log(`✅ Module processed: ${mod.title}`);
    }

    console.log('🎉 Level 2 course upload complete!');
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
}

uploadCourse();
