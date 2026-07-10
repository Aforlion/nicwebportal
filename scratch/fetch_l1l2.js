// Get IDs for Lesson 1 and Lesson 2 knowledge checks
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const sb = createClient(url, key);

async function main() {
    const { data: assessments, error } = await sb
        .from('assessments')
        .select(`id, title, grading_rubric, questions,
                 lessons!inner(title, modules!inner(title))`)
        .is('grading_rubric', null)
        .or('title.ilike.%Lesson 1%,title.ilike.%Lesson 2%');

    if (error) { console.error(error); return; }

    const needsRubric = assessments.filter(a =>
        a.questions?.some(q => q.type === 'essay' || q.type === 'report')
    );

    console.log(`Found ${needsRubric.length} lesson 1/2 checks needing rubrics\n`);
    needsRubric.forEach(a => {
        const mod = a.lessons?.modules?.title || 'UNKNOWN';
        console.log(`{ id: '${a.id}', module: '${mod}', title: '${a.title}' },`);
    });
}
main();
