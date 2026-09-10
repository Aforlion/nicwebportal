import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('Missing env configuration for onboarding nudge script')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const resend = new Resend(resendApiKey)

async function sendMonthlyOnboardingNudge() {
  console.log('=== RUNNING MONTHLY ONBOARDING REMINDER NUDGE ===')

  // 1. Fetch profiles of students & members
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['student', 'member'])

  if (pErr || !profiles) {
    console.error('Error fetching profiles:', pErr)
    return
  }

  // 2. Fetch all user_ids with enrollments
  const { data: enrollments } = await supabase.from('enrollments').select('user_id')
  const enrolledSet = new Set((enrollments || []).map(e => e.user_id))

  // Filter users with NO course enrollments
  const nonEnrolled = profiles.filter(p => p.email && !enrolledSet.has(p.id))

  console.log(`Found ${nonEnrolled.length} non-enrolled members to nudge.`)

  let successCount = 0
  let errorCount = 0

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

  for (const user of nonEnrolled) {
    const firstName = (user.full_name || 'Caregiver').trim().split(' ')[0]
    const loginUrl = `${baseUrl}/login`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Unlock Your Potential with NIC</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
          .badge { display: inline-block; background-color: #fef3c7; color: #b45309; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 14px; }
          .content { padding: 24px 0; line-height: 1.7; font-size: 16px; color: #334155; }
          .hero-box { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center; }
          .hero-box h3 { margin: 0 0 8px 0; color: #f59e0b; font-size: 18px; }
          .hero-box p { margin: 0; font-size: 14px; color: #cbd5e1; }
          .cta-btn { display: inline-block; background-color: #d97706; color: #ffffff !important; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin-top: 20px; shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.4); }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Monthly Caregiver Inspiration</span>
            <div class="title">Your Caregiving Journey Awaits! 🌟</div>
          </div>

          <div class="content">
            <p>Hi <strong>${firstName}</strong>,</p>

            <p>We hope your week is starting off wonderfully! As a registered member of the <strong>National Institute of Caregivers (NIC Nigeria)</strong>, you are part of an elite community dedicated to compassionate, high-standard care.</p>

            <div class="hero-box">
              <h3>Ready to Take Your Next Step? 🚀</h3>
              <p>You have taken the first big step by registering. Now it's time to unlock your full potential and get certified!</p>
            </div>

            <p>Starting a course today opens doors to accredited credentials, higher career recognition, and certified expertise. Whether you're looking into <em>Fundamentals of Professional Caregiving</em> or our specialized CPD micro-credentials, continuous learning is your key to excellence.</p>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="cta-btn">Log In & Start Learning Today →</a>
            </div>

            <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
              Need assistance selecting the right course? Reply to this email or reach out to our learning advisors anytime!
            </p>

            <p style="margin-top: 24px; font-weight: 600;">
              Keep shining,<br>
              <span style="color: #0f172a;">The NIC Learning & Development Team</span><br>
              <span style="color: #94a3b8; font-size: 13px;">National Institute of Caregivers</span>
            </p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} National Institute of Caregivers (NIC Nigeria). All rights reserved.<br>
            www.nicnigeria.org
          </div>
        </div>
      </body>
      </html>
    `

    try {
      const { error } = await resend.emails.send({
        from: 'National Institute of Caregivers <notifications@nicnigeria.org>',
        to: user.email,
        subject: `🌟 Hi ${firstName}, Your Caregiving Career Growth Starts Today!`,
        html: htmlContent
      })

      if (error) {
        console.error(`Failed sending nudge to ${user.email}:`, error)
        errorCount++
      } else {
        successCount++
        console.log(`Sent monthly onboarding nudge to ${user.email}`)
      }
    } catch (e: any) {
      console.error(`Exception sending to ${user.email}:`, e.message)
      errorCount++
    }
  }

  console.log(`\n=== MONTHLY ONBOARDING NUDGE SUMMARY ===`)
  console.log(`Successfully sent: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

sendMonthlyOnboardingNudge().catch(console.error)
