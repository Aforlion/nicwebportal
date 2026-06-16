const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyaeabdaxqrdosdksqwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YWVhYmRheHFyZG9zZGtzcXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzk5ODIsImV4cCI6MjA4Mzk1NTk4Mn0.POxoRZGE_07yqi4VSUBHksd-iybSx3ZClwYFv2WMRbg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Querying profile for adebolajoshuaj@gmail.com...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'adebolajoshuaj@gmail.com');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles data:', JSON.stringify(data, null, 2));
  }
}

run();
