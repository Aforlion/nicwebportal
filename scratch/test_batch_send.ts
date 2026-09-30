import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

async function testBatch() {
  console.log('Testing Resend Batch API capability...');
  try {
    const batchResult = await resend.batch.send([
      {
        from: 'National Institute of Caregivers <notifications@nicnigeria.org>',
        to: 'aforlion@gmail.com',
        subject: '🧪 Tuesday Study Reminder (Test Batch 1)',
        html: '<p>Test email 1 via Resend Batch API</p>',
      },
      {
        from: 'National Institute of Caregivers <notifications@nicnigeria.org>',
        to: 'ikechukwuamalu2@gmail.com',
        subject: '🧪 Tuesday Study Reminder (Test Batch 2)',
        html: '<p>Test email 2 via Resend Batch API</p>',
      },
    ]);

    console.log('✅ Resend Batch Result:', JSON.stringify(batchResult, null, 2));
  } catch (err: any) {
    console.error('❌ Resend Batch Error:', err);
  }
}

testBatch();
