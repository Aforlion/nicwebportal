import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAccess() {
  console.log('Verifying certificate records visibility...\n');

  // 1. Adebola
  const adebolaId = '59e21db9-e7e4-47de-bf7c-aaaf27f11f14';
  const { data: adebolaCerts } = await supabase
    .from('certificates')
    .select(`
      *,
      courses (title, level)
    `)
    .eq('user_id', adebolaId);

  console.log(`Adebola Mariam Joshua Certificates (${adebolaCerts?.length}):`);
  for (const c of adebolaCerts || []) {
    console.log(`  Code: ${c.certificate_number} | Title: ${c.courses?.title} | Level: ${c.course_level} | Date: ${c.issue_date}`);
  }

  // 2. Okorie
  const okorieId = 'c23193ca-d703-4814-9962-d5deeb0fbfd7';
  const { data: okorieCerts } = await supabase
    .from('certificates')
    .select(`
      *,
      courses (title, level)
    `)
    .eq('user_id', okorieId);

  console.log(`\nOkorie Chinwendu Nnena Certificates (${okorieCerts?.length}):`);
  for (const c of okorieCerts || []) {
    console.log(`  Code: ${c.certificate_number} | Title: ${c.courses?.title} | Level: ${c.course_level} | Date: ${c.issue_date}`);
  }
}

verifyAccess();
