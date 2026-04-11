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

const filePath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.md';

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
  assessment?: Assessment;
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
    // Match line like "1. b" or "1.  b)" or "1. b | 2. b"
    if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        for (const part of parts) {
            const subMatch = part.trim().match(/^(\d+)\.\s*([a-d])\)?$/i);
            if (subMatch) {
                answers[parseInt(subMatch[1])] = subMatch[2].toLowerCase();
            }
        }
    } else {
        const match = trimmed.match(/^(\d+)\.\s*([a-d])\)?$/i);
        if (match) {
            answers[parseInt(match[1])] = match[2].toLowerCase();
        }
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
    // Match "1. Question" or "**1. Question**"
    if (/^\**\d+\.\s+/.test(trimmed)) {
      if (currentQuestion) questions.push(currentQuestion);
      qCount++;
      currentQuestion = {
        question: trimmed.replace(/^\**\d+\.\s*/, '').replace(/\**$/, '').trim(),
        options: [],
        answer: answers[qCount] || '',
      };
    } else if (/^[a-d]\)\s*/i.test(trimmed)) {
      if (currentQuestion) {
        currentQuestion.options.push(trimmed.replace(/^[a-d]\)\s*/i, '').trim());
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

async function uploadCourse() {
  console.log('🚀 Starting Level 4 course ingestion...');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const courseTitle = 'NIC Care Supervisor & Facility Manager (Level 4)';
  const courseSlug = 'nic-care-supervisor-facility-manager-level-4';
  
  // 1. Get Course Description (Everything before Module 1)
  const introParts = content.split(/^# Module 1:/m);
  const courseDescription = introParts[0].trim();

  // 2. Extract Modules
  const modules: Module[] = [];
  const moduleRegex = /^# Module (\d+): (.*)$/gm;
  let moduleMatch;
  const moduleStartIndices: number[] = [];
  const moduleHeaders: string[] = [];

  // Reset regex
  moduleRegex.lastIndex = 0;
  while ((moduleMatch = moduleRegex.exec(content)) !== null) {
    moduleStartIndices.push(moduleMatch.index);
    moduleHeaders.push(moduleMatch[2]);
  }

  for (let i = 0; i < moduleStartIndices.length; i++) {
    const start = moduleStartIndices[i];
    const end = moduleStartIndices[i + 1] || content.length;
    const moduleContent = content.substring(start, end);
    
    const currentModule: Module = {
      title: moduleHeaders[i],
      description: '',
      lessons: [],
      sort_order: i + 1,
    };

    // Split module into Lessons
    const lessonRegex = /^# Lesson (\d+): (.*)$/gm;
    let lessonMatch;
    const lessonStartIndices: number[] = [];
    const lessonHeaders: string[] = [];

    // Module description is before first lesson
    const firstLessonMatch = lessonRegex.exec(moduleContent);
    if (firstLessonMatch) {
        currentModule.description = moduleContent.substring(0, firstLessonMatch.index).trim();
        lessonStartIndices.push(firstLessonMatch.index);
        lessonHeaders.push(firstLessonMatch[2]);
        
        while ((lessonMatch = lessonRegex.exec(moduleContent)) !== null) {
            lessonStartIndices.push(lessonMatch.index);
            lessonHeaders.push(lessonMatch[2]);
        }
    }

    for (let j = 0; j < lessonStartIndices.length; j++) {
        const lStart = lessonStartIndices[j];
        const lEnd = lessonStartIndices[j + 1] || moduleContent.length;
        let lessonBody = moduleContent.substring(lStart, lEnd);

        // Check if this lesson contains the assessment
        if (lessonBody.includes('# Module ' + (i + 1) + ' Assessment:')) {
            const assessmentParts = lessonBody.split(/# Module \d+ Assessment: /);
            lessonBody = assessmentParts[0];
            const assessmentFull = assessmentParts[1];
            
            const mcqParts = assessmentFull.split(/### Answer Key/i);
            if (mcqParts.length > 1) {
                const mcqText = mcqParts[0];
                const answerText = mcqParts[1].split(/^# |^## /m)[0]; // Until next header
                const questions = parseMCQs(mcqText, answerText);
                currentModule.assessment = {
                    title: `Module ${i + 1} Assessment`,
                    type: 'quiz',
                    questions: questions
                };
            }
        }

        const lessonTitle = lessonHeaders[j];
        currentModule.lessons.push({
            title: lessonTitle,
            slug: slugify(lessonTitle),
            content: lessonBody.replace(/^# Lesson \d+: .*$/m, '').trim(),
            sort_order: j + 1
        });
    }

    modules.push(currentModule);
  }

  // 3. Extract Comprehensive Final Exam
  let finalExam: Assessment | null = null;
  if (content.includes('# Comprehensive Final Exam:')) {
      const finalParts = content.split(/# Comprehensive Final Exam: .*/);
      const finalFull = finalParts[1];
      const mcqParts = finalFull.split(/### Answer Key/i);
      if (mcqParts.length > 1) {
          const mcqText = mcqParts[0];
          const answerText = mcqParts[1].split(/# |## /)[0];
          const questions = parseMCQs(mcqText, answerText);
          finalExam = {
              title: 'Comprehensive Final Exam',
              type: 'exam',
              questions: questions
          };
      }
  }

  console.log(`Parsed ${modules.length} modules, ${modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons, and ${finalExam ? '1 Final Exam' : '0 Final Exam'}.`);

  try {
    // A. Upsert Course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .upsert({
        title: courseTitle,
        slug: courseSlug,
        description: courseDescription,
        level: 'Expert',
        price: 250000,
        duration_hours: 45,
        thumbnail_url: 'https://fyaeabdaxqrdosdksqwx.supabase.co/storage/v1/object/public/course-resources/course-banners/level4-banner.png',
        is_published: true,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (courseError) throw courseError;
    const courseId = courseData.id;
    console.log(`✅ Course Created: ${courseId}`);

    // B. Process Modules
    for (const mod of modules) {
      // Manual Find or Create for Module since no unique constraint on (course_id, title)
      let moduleId: string;
      const { data: existingMod, error: findError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('title', mod.title)
        .maybeSingle();

      if (findError) throw findError;

      if (existingMod) {
        moduleId = existingMod.id;
        const { error: updateError } = await supabase
          .from('modules')
          .update({
            description: mod.description,
            sort_order: mod.sort_order,
          })
          .eq('id', moduleId);
        if (updateError) throw updateError;
      } else {
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
        moduleId = newMod.id;
      }

      // C. Process Lessons
      for (const lesson of mod.lessons) {
        const { data: lData, error: lError } = await supabase
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

        if (lError) {
          console.error(`Error uploading lesson ${lesson.title}:`, lError);
          continue;
        }
      }

      // D. Process Module Assessment
      if (mod.assessment) {
        const { data: lData, error: lError } = await supabase
          .from('lessons')
          .upsert({
            module_id: moduleId,
            title: mod.assessment.title,
            slug: slugify(mod.assessment.title),
            content: 'Please complete this multiple-choice assessment to demonstrate your understanding of the module content. A passing score of 75% is required.',
            sort_order: mod.lessons.length + 1,
          }, { onConflict: 'module_id, slug' })
          .select()
          .single();

        if (!lError) {
          await supabase
            .from('assessments')
            .upsert({
              lesson_id: lData.id,
              title: mod.assessment.title,
              type: mod.assessment.type,
              questions: mod.assessment.questions,
              passing_score: 75,
            }, { onConflict: 'lesson_id' });
        }
      }
      console.log(`✅ Module Ingested: ${mod.title}`);
    }

    // E. Process Comprehensive Final Exam (Attach to the last module or the conclusion lesson)
    if (finalExam && modules.length > 0) {
        const lastModule = modules[modules.length - 1];
        // Get the actual moduleId from DB (upserted above)
        const { data: dbMod } = await supabase.from('modules').select('id').eq('course_id', courseId).eq('title', lastModule.title).single();
        
        const { data: lData, error: lError } = await supabase
          .from('lessons')
          .upsert({
            module_id: dbMod!.id,
            title: finalExam.title,
            slug: slugify(finalExam.title),
            content: 'This is the Comprehensive Final Exam for the Level 4 course. It covers all 6 modules. You must achieve a score of 75% to be eligible for certification.',
            sort_order: lastModule.lessons.length + 2,
          }, { onConflict: 'module_id, slug' })
          .select()
          .single();

        if (!lError) {
          await supabase
            .from('assessments')
            .upsert({
              lesson_id: lData.id,
              title: finalExam.title,
              type: finalExam.type,
              questions: finalExam.questions,
              passing_score: 75,
            }, { onConflict: 'lesson_id' });
        }
        console.log('✅ Final Exam Ingested');
    }

    console.log('🎉 Course Ingestion Complete!');
  } catch (err) {
    console.error('❌ Ingestion failed:', err);
  }
}

uploadCourse();
