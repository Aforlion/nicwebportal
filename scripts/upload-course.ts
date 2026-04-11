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

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Caregiver_Refresher_Program.md';

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
    // Match "1. b" or "1.  b"
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
    if (/^\d+\./.test(trimmed)) {
      if (currentQuestion) questions.push(currentQuestion);
      qCount++;
      currentQuestion = {
        question: trimmed.replace(/^\d+\.\s*/, ''),
        options: [],
        answer: answers[qCount] || '',
      };
    } else if (/^[a-d]\)/.test(trimmed)) {
      if (currentQuestion) {
        currentQuestion.options.push(trimmed.replace(/^[a-d]\)\s*/, ''));
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

async function uploadCourse() {
  console.log('Starting course upload...');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract Course Title from # header
  const courseTitleLine = content.split('\n').find(l => l.startsWith('# '));
  const courseTitle = courseTitleLine ? courseTitleLine.replace('# ', '').trim() : 'NIC Caregiver Refresher Program';
  
  let course: Course = {
    title: courseTitle,
    slug: slugify(courseTitle),
    description: '',
    modules: [],
  };

  // Split by Module headers (H2)
  const moduleSplits = content.split(/^## (Module \d+:.*)$/m);
  
  // Course description is in the introduction part
  const introPart = moduleSplits[0];
  const introContent = introPart.split('## Introduction')[1] || introPart;
  course.description = introContent.trim();

  for (let i = 1; i < moduleSplits.length; i += 2) {
    const moduleHeader = moduleSplits[i];
    const moduleFullContent = moduleSplits[i + 1];

    const moduleTitle = moduleHeader.replace(/^Module \d+: /, '').trim();
    const currentModule: Module = {
      title: moduleTitle,
      description: '',
      lessons: [],
      sort_order: course.modules.length + 1,
    };

    // Split module content by Lesson headers (H3)
    const lessonSplits = moduleFullContent.split(/^### (Lesson \d+:.*)$/m);
    
    // Module intro is the content before the first lesson
    currentModule.description = lessonSplits[0].trim();

    for (let j = 1; j < lessonSplits.length; j += 2) {
      const lessonHeader = lessonSplits[j];
      let lessonBody = lessonSplits[j + 1];

      const lessonTitle = lessonHeader.replace(/^Lesson \d+: /, '').trim();
      
      // Check for assessment within the lesson body (it's usually at the end of the last lesson of a module)
      const assessmentIndicator = '## Module ' + Math.ceil(i/2) + ' Assessment';
      const assessmentSplit = lessonBody.split(new RegExp(`## Module \\d+ Assessment`, 'i'));
      
      let assessmentData: Assessment | undefined = undefined;
      
      if (assessmentSplit.length > 1) {
        lessonBody = assessmentSplit[0]; // Text before Assessment header
        const assessmentContent = assessmentSplit[1];
        
        const mcqStart = assessmentContent.search(/#### Multiple Choice Questions \(MCQs\)/i);
        if (mcqStart !== -1) {
          const mcqSection = assessmentContent.substring(mcqStart);
          const mcqParts = mcqSection.split(/#### Answer Key for MCQs/i);
          const mcqText = mcqParts[0];
          const answerText = mcqParts[1] || '';
          
          const questions = parseMCQs(mcqText, answerText);
          if (questions.length > 0) {
            assessmentData = {
              title: `${moduleTitle} Quiz`,
              type: 'quiz',
              questions: questions,
            };
          }
        }
      }

      const currentLesson: Lesson = {
        title: lessonTitle,
        slug: slugify(lessonTitle),
        content: lessonBody.trim(),
        sort_order: currentModule.lessons.length + 1,
      };
      currentModule.lessons.push(currentLesson);

      if (assessmentData) {
        currentModule.lessons.push({
          title: `${moduleTitle} Assessment`,
          slug: slugify(`${moduleTitle} Assessment`),
          content: 'Complete this assessment to verify your understanding of this module.',
          sort_order: currentModule.lessons.length + 1,
          assessment: assessmentData
        });
      }
    }

    course.modules.push(currentModule);
  }

  console.log(`Parsed ${course.modules.length} modules.`);
  
  try {
    // 1. Upsert Course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .upsert({
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: 'Advanced',
        is_published: true,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (courseError) throw courseError;
    const courseId = courseData.id;
    console.log(`Course upserted: ${course.title} (${courseId})`);

    // 2. Process Modules
    for (const mod of course.modules) {
      let { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('title', mod.title)
        .maybeSingle();

      if (!moduleData) {
        const { data: newMod, error: insertModError } = await supabase
          .from('modules')
          .insert({
            title: mod.title,
            description: mod.description,
          })
          .select()
          .single();
        if (insertModError) throw insertModError;
        moduleData = newMod;
      } else {
        await supabase.from('modules').update({
          description: mod.description
        }).eq('id', moduleData.id);
      }
      
      const moduleId = moduleData!.id;

      // 3. Link Module to Course
      const { error: cmError } = await supabase
        .from('course_modules')
        .upsert({
          course_id: courseId,
          module_id: moduleId,
          sort_order: mod.sort_order,
        }, { onConflict: 'course_id, module_id' });

      if (cmError) console.error(`Error linking module ${mod.title}:`, cmError);

      // 4. Process Lessons
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

        // 5. Process Assessment if exists
        if (lesson.assessment) {
          const { error: astError } = await supabase
            .from('assessments')
            .upsert({
              lesson_id: lessonData.id,
              title: lesson.assessment.title,
              type: lesson.assessment.type,
              questions: lesson.assessment.questions,
            }, { onConflict: 'lesson_id' });
          
          if (astError) console.error(`Error uploading assessment for ${lesson.title}:`, astError);
        }
      }
      console.log(`Module processed: ${mod.title}`);
    }

    console.log('Course upload complete!');
  } catch (err) {
    console.error('Upload failed:', err);
  }
}

uploadCourse();
