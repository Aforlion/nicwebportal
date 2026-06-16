/**
 * fix_affected_users.js
 * 
 * One-time fix script for users who:
 *   1. Have no password set (created via admin invite/bulk-import)
 *   2. Are stuck because old recovery links pointed directly to /reset-password
 *      (bypassing PKCE code exchange at /auth/callback)
 * 
 * What this script does:
 *   - Sends a fresh recovery link (now correctly routed through /auth/callback)
 *   - Fixes Adebola's membership is_active flag
 * 
 * Usage: node scratch/fix_affected_users.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const DRY_RUN = process.argv.includes('--dry-run');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});
const resend = new Resend(resendApiKey);

// -----------------------------------------------
// The specific user reported as broken
// -----------------------------------------------
const PRIORITY_USER = 'adebolajoshuaj@gmail.com';

async function fixMembership(userId, email) {
    console.log(`  Fixing membership is_active for ${email}...`);
    if (DRY_RUN) { console.log('  [DRY RUN] Would set is_active=true, status=active'); return; }

    const { error } = await supabase
        .from('memberships')
        .update({ is_active: true, status: 'active' })
        .eq('user_id', userId);

    if (error) {
        console.error(`  ERROR fixing membership: ${error.message}`);
    } else {
        console.log(`  ✓ Membership fixed`);
    }
}

async function sendRecoveryLink(user) {
    const email = user.email;
    const name = user.user_metadata?.full_name || 'Member';
    
    console.log(`\nProcessing: ${email} (${name})`);
    console.log(`  Last sign in: ${user.last_sign_in_at || 'NEVER'}`);
    console.log(`  Recovery previously sent: ${user.recovery_sent_at || 'N/A'}`);

    if (DRY_RUN) {
        console.log('  [DRY RUN] Would generate recovery link and send email');
        return;
    }

    // Generate fresh recovery link — now correctly routes through /auth/callback
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
            redirectTo: `${APP_URL}/auth/callback?next=/reset-password`
        }
    });

    if (linkError) {
        console.error(`  ERROR generating link: ${linkError.message}`);
        return;
    }

    const resetLink = linkData?.properties?.action_link;
    if (!resetLink) {
        console.error(`  ERROR: No action_link in response`);
        return;
    }

    console.log(`  ✓ Recovery link generated`);

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
        from: 'NIC Portal <notifications@nicnigeria.org>',
        to: email,
        replyTo: 'support@nicnigeria.org',
        subject: 'Action Required: Set Your NIC Portal Password',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #0F766E;">National Institute of Caregivers</h2>
  </div>
  
  <p>Dear ${name},</p>
  
  <p>We noticed you haven't been able to access your NIC Portal account. We've fixed the issue on our end and generated a fresh password setup link just for you.</p>
  
  <p><strong>Click the button below to set your password and access your account:</strong></p>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="${resetLink}" 
       style="background-color: #0F766E; color: white; padding: 14px 28px; 
              text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
      Set My Password
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;">⏰ This link expires in <strong>24 hours</strong>. If it expires, please visit 
  <a href="${APP_URL}/forgot-password">nicnigeria.org/forgot-password</a> to request a new one.</p>
  
  <p style="color: #666; font-size: 14px;">If you have any issues, please reply to this email or contact us at support@nicnigeria.org</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #999; font-size: 12px; text-align: center;">National Institute of Caregivers (NIC) | Nigeria</p>
</body>
</html>
        `.trim()
    });

    if (emailError) {
        console.error(`  ERROR sending email: ${JSON.stringify(emailError)}`);
    } else {
        console.log(`  ✓ Recovery email sent to ${email}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 700));
}

async function run() {
    console.log(`\n=== NIC Portal: Fix Affected Users (DRY_RUN: ${DRY_RUN}) ===\n`);

    // Fetch all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) {
        console.error('Failed to list users:', authError.message);
        process.exit(1);
    }

    const allUsers = authData.users;
    console.log(`Total users in system: ${allUsers.length}`);

    // Find users with no password (created via admin API without a password)
    const noPasswordUsers = allUsers.filter(u =>
        !u.encrypted_password || u.encrypted_password.length < 10
    );

    console.log(`Users with no password set: ${noPasswordUsers.length}`);
    
    // --- Priority: Fix Adebola first ---
    const adebola = allUsers.find(u => u.email === PRIORITY_USER);
    if (adebola) {
        console.log(`\n=== PRIORITY FIX: ${PRIORITY_USER} ===`);
        await fixMembership(adebola.id, PRIORITY_USER);
        await sendRecoveryLink(adebola);
    } else {
        console.log(`\nWARNING: ${PRIORITY_USER} not found in auth users!`);
    }

    // --- Fix remaining users with no password ---
    const remaining = noPasswordUsers.filter(u => u.email !== PRIORITY_USER);
    
    if (remaining.length === 0) {
        console.log('\n✓ No other users with missing passwords found.');
    } else {
        console.log(`\n=== Sending recovery links to ${remaining.length} other users ===`);
        for (const user of remaining) {
            await sendRecoveryLink(user);
        }
    }

    console.log('\n=== Done ===');
    if (DRY_RUN) {
        console.log('\nThis was a DRY RUN. Run without --dry-run to execute changes.');
    }
}

run().catch(console.error);
