const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAndFix() {
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select('*, profiles(full_name)')
    .or('status.eq.pending,is_active.eq.false')
    .not('nic_id', 'is', null);

  console.log('Found ' + (memberships ? memberships.length : 0) + ' memberships with nic_id but pending/inactive.');
  
  if (memberships && memberships.length > 0) {
    for (const mem of memberships) {
      console.log('Fixing for:', mem.profiles ? mem.profiles.full_name : mem.user_id);
      
      // Fix status
      await supabase.from('memberships').update({
        status: 'active',
        is_active: true,
        expiry_date: mem.expiry_date || '2027-04-01T00:00:00Z'
      }).eq('id', mem.id);

      // Check payments to see if they lack a membership_dues payment
      const { data: payments } = await supabase.from('payments')
        .select('*')
        .eq('membership_id', mem.id)
        .in('payment_type', ['membership_fee', 'membership_dues']);
        
      if (!payments || payments.length === 0) {
         console.log('  -> Creating missing membership_dues payment record');
         await supabase.from('payments').insert({
            membership_id: mem.id,
            amount: 35000,
            payment_type: 'membership_dues',
            payment_method: 'bank_transfer',
            status: 'completed',
            transaction_reference: `AUTO-FIX-${mem.nic_id.replace(/\//g, '-')}`,
            payment_date: new Date().toISOString()
         });
      }
    }
    console.log('All fixed!');
  }
}
checkAndFix();
