import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function triggerCronReminders() {
  console.log('==================================================');
  console.log('  Executing Tuesday & Monthly Cron Reminders Test');
  console.log('==================================================');

  // We can call the route handlers directly
  const { GET: tuesdayGet } = await import('../src/app/api/cron/tuesday-study-reminder/route');
  const { GET: monthlyGet } = await import('../src/app/api/cron/monthly-onboarding-reminder/route');

  const dummyReq = new Request('http://localhost:3000/api/cron/tuesday-study-reminder');

  console.log('\n--- 1. Executing Tuesday Study Reminder Cron ---');
  const tuesdayRes = await tuesdayGet(dummyReq);
  const tuesdayData = await tuesdayRes.json();
  console.log('Tuesday Cron Result:', JSON.stringify(tuesdayData, null, 2));

  console.log('\n--- 2. Executing Monthly Onboarding Reminder Cron ---');
  const monthlyRes = await monthlyGet(dummyReq);
  const monthlyData = await monthlyRes.json();
  console.log('Monthly Cron Result:', JSON.stringify(monthlyData, null, 2));

  console.log('==================================================');
}

triggerCronReminders();
