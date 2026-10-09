import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking lessons table structure...');
  const { data, error } = await supabase.from('lessons').select('*').limit(1);
  if (error) {
    console.error('Error fetching lessons:', error);
  } else {
    console.log('Lessons sample row keys:', data ? Object.keys(data[0] || {}) : 'No data');
  }

  const { data: modData, error: modError } = await supabase.from('modules').select('*').limit(1);
  if (modError) {
    console.error('Error fetching modules:', modError);
  } else {
    console.log('Modules sample row keys:', modData ? Object.keys(modData[0] || {}) : 'No data');
  }
}

checkSchema();
