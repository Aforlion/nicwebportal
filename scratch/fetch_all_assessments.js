const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const key = fs.readFileSync('.env.local','utf8').match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const sb = createClient('https://fyaeabdaxqrdosdksqwx.supabase.co', key);

async function main() {
    // Get all assessments with essay questions and no rubric, joined to lesson/module/course
    const { data: assessments, error } = await sb
        .from('assessments')
        .select(`
            id, title, lesson_id, grading_rubric, questions,
            lessons (
                id, title,
                modules (
                    id, title,
                    courses (id, title)
                )
            )
        `)
        .order('title');

    if (error) { console.error(error); return; }

    const needsRubric = assessments.filter(a => {
        const essays = a.questions?.filter(q => q.type === 'essay' || q.type === 'report') || [];
        return essays.length > 0 && !a.grading_rubric;
    });

    console.log(`NEEDS RUBRIC: ${needsRubric.length}\n`);

    // Group by course
    const byCourse = {};
    needsRubric.forEach(a => {
        const course = a.lessons?.modules?.courses?.title || 'UNKNOWN COURSE';
        const module = a.lessons?.modules?.title || 'UNKNOWN MODULE';
        const lesson = a.lessons?.title || 'UNKNOWN LESSON';
        if (!byCourse[course]) byCourse[course] = [];
        byCourse[course].push({ id: a.id, assessment: a.title, module, lesson, essayCount: a.questions.filter(q=>q.type==='essay'||q.type==='report').length });
    });

    Object.entries(byCourse).sort().forEach(([course, items]) => {
        console.log(`\n=== COURSE: ${course} (${items.length} assessments) ===`);
        items.forEach(i => {
            console.log(`  [${i.essayCount} essays] ${i.module} > ${i.lesson} > ${i.assessment}`);
            console.log(`    ID: ${i.id}`);
        });
    });
}

main();
