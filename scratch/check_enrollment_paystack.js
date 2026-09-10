const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });
const paystackSecret = process.env.PAYSTACK_LIVE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

async function checkEnrollmentRef() {
  const ref = '1788593772262';
  console.log(`Checking Paystack reference: ${ref}...`);
  const res = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
    headers: { Authorization: `Bearer ${paystackSecret}` }
  });
  const data = await res.json();
  console.log('Paystack Response for 1788593772262:', JSON.stringify(data, null, 2));
}

checkEnrollmentRef().catch(console.error);
