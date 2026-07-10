const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || require('fs').readFileSync('.env.local', 'utf8').match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    // Fetch all assessments with their course linkage
    const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
            id,
            title,
            description,
            type,
            passing_score,
            grading_rubric,
            questions
        `)
        .order('title');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`\n=== TOTAL ASSESSMENTS FOUND: ${assessments.length} ===\n`);

    assessments.forEach((a, i) => {
        const essayQs = a.questions?.filter(q => q.type === 'essay' || q.type === 'report') || [];
        console.log(`[${i+1}] ${a.title}`);
        console.log(`    ID: ${a.id}`);
        console.log(`    Type: ${a.type}`);
        console.log(`    Pass Score: ${a.passing_score}%`);
        console.log(`    Questions: ${a.questions?.length || 0} total, ${essayQs.length} essay/report`);
        console.log(`    Has Rubric: ${a.grading_rubric ? '✅ YES' : '❌ NO'}`);
        if (essayQs.length > 0) {
            console.log(`    Essay Questions:`);
            essayQs.forEach((q, qi) => {
                console.log(`      ${qi+1}. ${q.text?.substring(0, 100)}...`);
            });
        }
        console.log('');
    });
}

main();
