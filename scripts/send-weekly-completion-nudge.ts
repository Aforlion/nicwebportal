import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('Missing env configuration for weekly completion nudge script')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const resend = new Resend(resendApiKey)

async function sendWeeklyCompletionNudge() {
  console.log('=== RUNNING WEEKLY COURSE COMPLETION REMINDER NUDGE ===')

  // Fetch in-progress enrollments (< 100% progress and status != 'completed')
  const { data: enrollments, error: eErr } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress,
      user_id,
      courses ( title ),
      profiles ( full_name, email )
    `)
    .neq('status', 'completed')
    .lt('progress', 100)

  if (eErr || !enrollments) {
    console.error('Error fetching in-progress enrollments:', eErr)
    return;
  }

  console.log(`Found ${enrollments.length} in-progress enrollments to nudge.`)

  let successCount = 0
  let errorCount = 0

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

  for (const enroll of enrollments) {
    const profile = (enroll as any).profiles
    const course = (enroll as any).courses
    if (!profile || !profile.email) continue

    const firstName = (profile.full_name || 'Learner').trim().split(' ')[0]
    const courseTitle = course?.title || 'your course'
    const progress = Math.round(Number(enroll.progress) || 0)
    const portalUrl = `${baseUrl}/login`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>You're So Close! Finish Your Course</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 14px; }
          .content { padding: 24px 0; line-height: 1.7; font-size: 16px; color: #334155; }
          .progress-card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 20px; margin: 20px 0; }
          .progress-bar-bg { background-color: #e2e8f0; border-radius: 10px; height: 12px; overflow: hidden; margin-top: 10px; }
          .progress-bar-fill { background: linear-gradient(90deg, #d97706 0%, #f59e0b 100%); height: 100%; border-radius: 10px; }
          .cta-btn { display: inline-block; background-color: #d97706; color: #ffffff !important; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin-top: 20px; shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.4); }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Tuesday Learning Boost</span>
            <div class="title">You Are So Close to Your Certificate! 🎓</div>
          </div>

          <div class="content">
            <p>Hi <strong>${firstName}</strong>,</p>

            <p>Happy Tuesday! We noticed you've been making great strides in <strong>"${courseTitle}"</strong>. Every lesson you complete brings you closer to your official credential!</p>

            <div class="progress-card">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #0f172a;">
                <span>${courseTitle}</span>
                <span>${progress}% Complete</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
              </div>
            </div>

            <p>Don't stop now! Taking just 15 minutes today to complete your next lesson or assessment will keep your momentum going and get your official NIC Certificate ready.</p>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="cta-btn">Continue Learning Now →</a>
            </div>

            <p style="margin-top: 28px; font-weight: 600;">
              You've got this!<br>
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
        to: profile.email,
        subject: `💪 ${firstName}, you are ${progress}% through "${courseTitle}" – Keep going!`,
        html: htmlContent
      })

      if (error) {
        console.error(`Failed sending completion nudge to ${profile.email}:`, error)
        errorCount++
      } else {
        successCount++
        console.log(`Sent weekly completion nudge to ${profile.email} (${courseTitle} - ${progress}%)`)
      }
    } catch (e: any) {
      console.error(`Exception sending to ${profile.email}:`, e.message)
      errorCount++
    }
  }

  console.log(`\n=== WEEKLY COMPLETION NUDGE SUMMARY ===`)
  console.log(`Successfully sent: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

sendWeeklyCompletionNudge().catch(console.error)
