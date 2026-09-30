import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log("=== Notifying Cornel Greg ===")

    const facilityId = '826183fe-fa11-44a0-8255-9e4dc4b16b6f' // Divine Mother Inclusive Academy
    const recipientEmail = 'nimafidon@hotmail.com'
    const recipientName = 'Cornel Greg'
    const facilityName = 'Divine Mother Inclusive Academy'

    // 1. Update facility status in database
    const revisionNotes = "Revision Required: Submitted Google Drive link is restricted/inaccessible. Direct upload to NIC Cloud storage required along with 6-pillar competency mapping."

    const { error: updateErr } = await supabase
        .from('facilities')
        .update({
            curriculum_status: 'rejected',
            updated_at: new Date().toISOString()
        })
        .eq('id', facilityId)

    if (updateErr) {
        console.error("Failed to update facility status:", updateErr)
    } else {
        console.log(`Facility curriculum_status updated to 'rejected' for ${facilityName}`)
    }

    // 2. Insert audit log
    try {
        await supabase
            .from('registry_actions')
            .insert({
                target_id: facilityId,
                target_type: 'facility',
                action_type: 'reject_curriculum',
                reason: revisionNotes
            })
        console.log("Audit log recorded in registry_actions")
    } catch (e) {
        console.warn("Audit log warning:", e)
    }

    // 3. Compose rich HTML email
    const emailSubject = "Action Required: NIC Curriculum Evaluation & Standardization — Divine Mother Inclusive Academy"
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { background: #0f172a; padding: 24px 32px; text-align: left; }
            .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; }
            .content { padding: 32px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background-color: #fef3c7; color: #92400e; margin-bottom: 20px; }
            .callout { background-color: #f1f5f9; border-left: 4px solid #0b57d0; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; }
            .pillars-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .pillar-item { display: flex; margin-bottom: 10px; font-size: 13px; }
            .pillar-num { font-weight: bold; color: #0b57d0; width: 24px; }
            .btn { display: inline-block; background-color: #0b57d0; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
            .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>National Institute of Caregivers</h1>
                <p>Curriculum Standardization & Accreditation Board</p>
            </div>
            <div class="content">
                <span class="badge">Status: Revision Required</span>
                <p>Dear <strong>${recipientName}</strong>,</p>
                <p>Thank you for submitting the Level 1 Caregiver Training syllabus for <strong>${facilityName}</strong>. The NIC Board of Education has completed its preliminary administrative audit.</p>
                
                <div class="callout">
                    <strong>Administrative Audit Finding:</strong><br>
                    The document link provided (Google Drive) is restricted to private account permissions, preventing regulatory inspectors from reviewing the syllabus. Furthermore, in accordance with the statutory <em>NIC Institutional Storage Mandate</em>, all accreditation documents must be hosted directly within NIC's secure cloud infrastructure.
                </div>

                <h3>Required Actions for Approval:</h3>
                <ol style="font-size: 14px; padding-left: 20px; line-height: 1.8;">
                    <li><strong>Direct Document Upload:</strong> Log into your <a href="https://nicnigeria.org/portal/facility">Training Agency Portal</a> and upload your curriculum document (<code>DMIA Curriculum (Level 1).pdf</code>) directly using the newly enabled <strong>Upload Document to NIC Cloud</strong> button (PDF/DOCX up to 25MB).</li>
                    <li><strong>Alignment with the 6 Core Competency Pillars:</strong> Ensure your syllabus explicitly details contact hours, minimum 40% practical demonstration ratio, and coverage of the mandatory NIC standards:</li>
                </ol>

                <div class="pillars-box">
                    <div class="pillar-item"><span class="pillar-num">1.</span> <span><strong>Person-Centred Care & Ethics:</strong> Dignity, patient advocacy, confidentiality, and professional boundaries.</span></div>
                    <div class="pillar-item"><span class="pillar-num">2.</span> <span><strong>Basic Nursing & ADLs:</strong> Vital signs monitoring, personal hygiene, transfer ergonomics, and nutrition.</span></div>
                    <div class="pillar-item"><span class="pillar-num">3.</span> <span><strong>Infection Prevention & Control:</strong> Universal precautions, PPE donning/doffing, and biomedical waste disposal.</span></div>
                    <div class="pillar-item"><span class="pillar-num">4.</span> <span><strong>Health, Safety & Emergency Response:</strong> Hazard assessment, fall prevention, and basic first aid/CPR.</span></div>
                    <div class="pillar-item"><span class="pillar-num">5.</span> <span><strong>Safeguarding & Protection:</strong> Abuse identification, reporting channels, and vulnerable adult protection.</span></div>
                    <div class="pillar-item"><span class="pillar-num">6.</span> <span><strong>Practical Training & Practicum:</strong> 40% practical simulation ratio and clinical internship pathway.</span></div>
                </div>

                <p style="font-size: 14px;">Once re-uploaded directly to the portal, your curriculum will immediately proceed to final Board accreditation.</p>

                <a href="https://nicnigeria.org/portal/facility" class="btn">Log In to Facility Portal & Re-Upload</a>
            </div>
            <div class="footer">
                <p>National Institute of Caregivers (NIC Nigeria) • Regulatory Affairs & Accreditation</p>
                <p>This is an automated regulatory notification. For enquiries, contact education@nicnigeria.org</p>
            </div>
        </div>
    </body>
    </html>
    `

    // 4. Send email via Resend
    if (resendApiKey) {
        const resend = new Resend(resendApiKey)
        const { data: emailData, error: emailErr } = await resend.emails.send({
            from: 'NIC Notifications <notifications@nicnigeria.org>',
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml
        })

        if (emailErr) {
            console.error("Resend delivery failed:", emailErr)
        } else {
            console.log("Email successfully sent via Resend! ID:", emailData?.id)
        }
    } else {
        console.log("Mock email logged (no RESEND_API_KEY)")
    }

    console.log("Notification routine complete!")
}

main().catch(console.error)
