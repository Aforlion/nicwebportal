'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { env } from "@/env"

export interface PillarScore {
    pillarName: string
    score: number
    findings: string
    gaps: string
}

export interface CurriculumEvaluationResult {
    totalScore: number
    maxScore: number
    recommendedVerdict: 'approved' | 'approved_with_conditions' | 'revision_required' | 'rejected'
    practicalRatioAssessment: string
    pillarScores: PillarScore[]
    executiveFeedback: string
    evaluatedAt: string
}

const curriculumEvaluationSchema = {
    type: SchemaType.OBJECT,
    properties: {
        totalScore: {
            type: SchemaType.NUMBER,
            description: "Total score out of 18 points (0 to 3 points per pillar)"
        },
        recommendedVerdict: {
            type: SchemaType.STRING,
            enum: ["approved", "approved_with_conditions", "revision_required", "rejected"],
            description: "Regulatory recommendation based on the SOP-EDU-002 rubric"
        },
        pillarScores: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    pillarName: { type: SchemaType.STRING },
                    score: { type: SchemaType.NUMBER, description: "Score from 0 to 3" },
                    findings: { type: SchemaType.STRING, description: "Observed strengths and syllabus content" },
                    gaps: { type: SchemaType.STRING, description: "Missing competencies or required amendments" }
                },
                required: ["pillarName", "score", "findings", "gaps"]
            }
        },
        practicalRatioAssessment: {
            type: SchemaType.STRING,
            description: "Analysis of practical simulation and lab hours vs theory (minimum target: 40% practical)"
        },
        executiveFeedback: {
            type: SchemaType.STRING,
            description: "Official constructive feedback paragraph for the training agency administrator"
        }
    },
    required: ["totalScore", "recommendedVerdict", "pillarScores", "practicalRatioAssessment", "executiveFeedback"]
}

export async function evaluateFacilityCurriculumAction(facilityId: string) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Fetch facility record
        const { data: facility, error: facErr } = await supabase
            .from('facilities')
            .select(`
                id,
                name,
                curriculum_url,
                curriculum_status,
                owner_id,
                profiles:owner_id (
                    id,
                    full_name,
                    email
                )
            `)
            .eq('id', facilityId)
            .single()

        if (facErr || !facility) {
            return { error: 'Facility not found' }
        }

        if (!facility.curriculum_url) {
            return { error: 'No curriculum has been submitted by this facility yet.' }
        }

        const apiKey = env.GOOGLE_GEMINI_API_KEY
        if (!apiKey) {
            return { error: 'Google Gemini API Key is not configured in server environment.' }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: curriculumEvaluationSchema as any
            }
        })

        // 2. Determine document access and extract contents
        let documentPart: any = null
        let textFallback = ""

        try {
            // Attempt to fetch file from URL (e.g. Supabase storage public URL)
            const fileResp = await fetch(facility.curriculum_url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(15000)
            })

            const contentType = fileResp.headers.get('content-type') || ''
            if (contentType.includes('pdf') || facility.curriculum_url.endsWith('.pdf')) {
                const arrayBuf = await fileResp.arrayBuffer()
                const base64Data = Buffer.from(arrayBuf).toString('base64')
                documentPart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: 'application/pdf'
                    }
                }
            } else {
                textFallback = await fileResp.text()
            }
        } catch (fetchErr: any) {
            console.warn("Could not directly stream document buffer:", fetchErr.message)
            textFallback = `Document URL: ${facility.curriculum_url}. (Direct stream timed out or link is restricted).`
        }

        // 3. Build Prompt aligning with SOP-EDU-002
        const systemPrompt = `
You are the Chief Academic Evaluator for the National Institute of Caregivers (NIC Nigeria).
Your role is to strictly evaluate this caregiver training curriculum against NIC's statutory standard (SOP-EDU-002).

Every approved training partner curriculum must satisfy the Six Core Competency Pillars:
1. Person-Centred Care & Ethics (Dignity, privacy, patient advocacy, confidentiality, effective communication)
2. Basic Nursing & Daily Living Assistance Skills (Vital signs: BP, pulse, temp, respiration; ADLs: bathing, hygiene, feeding, safe transfer)
3. Infection Prevention & Control - IPC (Hand hygiene 5 moments, PPE protocols, biomedical waste disposal, sanitization)
4. Health, Safety & Emergency Procedures (Fall prevention, hazard assessment, basic first aid & CPR, fire safety)
5. Safeguarding & Vulnerable Adult Protection (Abuse recognition, mandatory incident reporting, whistleblowing, vulnerable adult protections)
6. Practical Learning Ratio & Clinical Practicum Pathway (Minimum 40% practical hands-on simulation, clinical placement pathway)

Scoring scale for each pillar:
0 = Absent (not mentioned)
1 = Incomplete (surface mention without actionable outcomes)
2 = Substantially Compliant (covers core concepts, needs slight refinement in rubrics or hours)
3 = Fully Compliant (thorough, detailed syllabus, clear practical exercises, measurable outcomes)

Total possible: 18 points.
- 16 to 18: approved
- 12 to 15: approved_with_conditions
- 8 to 11: revision_required
- Under 8 (or inaccessible): rejected

Facility Name: "${facility.name}"
Curriculum URL: "${facility.curriculum_url}"
        `

        const contents: any[] = [systemPrompt]
        if (documentPart) {
            contents.push(documentPart)
        } else {
            contents.push(`Provided document syllabus information / text:\n${textFallback.slice(0, 5000)}`)
        }

        const result = await model.generateContent(contents)
        const responseText = result.response.text()
        const evaluationData: CurriculumEvaluationResult = {
            ...JSON.parse(responseText),
            maxScore: 18,
            evaluatedAt: new Date().toISOString()
        }

        // 4. Save evaluation audit log into registry_actions
        try {
            await supabase
                .from('registry_actions')
                .insert({
                    target_id: facilityId,
                    target_type: 'facility',
                    action_type: 'ai_curriculum_evaluation',
                    performed_by: user?.id,
                    reason: `AI Evaluation: ${evaluationData.totalScore}/18 - Recommendation: ${evaluationData.recommendedVerdict}`,
                    metadata: evaluationData
                })
        } catch (logErr) {
            console.warn("Could not save evaluation audit log:", logErr)
        }

        return {
            success: true,
            facility,
            evaluation: evaluationData
        }

    } catch (err: any) {
        console.error("AI Curriculum Evaluation error:", err)
        return { error: err.message || 'AI evaluation service encountered an error' }
    }
}

export async function sendCurriculumReviewDecisionAction(
    facilityId: string,
    verdict: 'approved' | 'approved_with_conditions' | 'rejected',
    feedbackNotes: string,
    pillarScores?: PillarScore[]
) {
    await requireAdmin()
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Fetch facility & owner
        const { data: facility, error: fetchErr } = await supabase
            .from('facilities')
            .select(`
                id,
                name,
                curriculum_url,
                owner_id,
                profiles:owner_id (
                    id,
                    full_name,
                    email
                )
            `)
            .eq('id', facilityId)
            .single()

        if (fetchErr || !facility) {
            return { error: 'Facility not found' }
        }

        const ownerProfile = Array.isArray(facility.profiles) ? facility.profiles[0] : facility.profiles
        const recipientEmail = ownerProfile?.email
        const recipientName = ownerProfile?.full_name || 'Facility Administrator'

        // 2. Update facility curriculum_status
        const dbStatus = verdict === 'approved' ? 'approved' : 'rejected'
        const { error: updateErr } = await supabase
            .from('facilities')
            .update({
                curriculum_status: dbStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', facilityId)

        if (updateErr) {
            return { error: 'Failed to update curriculum status in database' }
        }

        // 3. Log in registry_actions audit trail
        try {
            await supabase
                .from('registry_actions')
                .insert({
                    target_id: facilityId,
                    target_type: 'facility',
                    action_type: verdict === 'approved' ? 'approve_curriculum' : 'reject_curriculum',
                    performed_by: user?.id,
                    reason: feedbackNotes,
                    metadata: { verdict, feedbackNotes, pillarScores }
                })
        } catch (e) {
            console.warn("Audit log warning:", e)
        }

        // 4. Send formal email via Resend if email is available
        if (recipientEmail && env.RESEND_API_KEY) {
            const resend = new Resend(env.RESEND_API_KEY)
            const subject = verdict === 'approved'
                ? `Official Approval: Caregiver Curriculum Accredited — ${facility.name}`
                : `Action Required: Curriculum Standardization Notice — ${facility.name}`

            const isApproved = verdict === 'approved'

            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                    .header { background: #0f172a; padding: 24px 32px; color: white; }
                    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
                    .header p { margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; }
                    .content { padding: 32px; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background-color: ${isApproved ? '#dcfce7' : '#fef3c7'}; color: ${isApproved ? '#166534' : '#92400e'}; margin-bottom: 16px; }
                    .feedback-box { background: #f1f5f9; border-left: 4px solid ${isApproved ? '#10b981' : '#0b57d0'}; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; }
                    .btn { display: inline-block; background-color: #0b57d0; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
                    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>National Institute of Caregivers (NIC Nigeria)</h1>
                        <p>Curriculum Standardization & Board of Education</p>
                    </div>
                    <div class="content">
                        <span class="badge">${isApproved ? 'Accreditation Approved' : 'Revision Required'}</span>
                        <p>Dear <strong>${recipientName}</strong>,</p>
                        <p>The NIC Board of Education has completed its formal evaluation of the curriculum submitted for <strong>${facility.name}</strong>.</p>
                        
                        <div class="feedback-box">
                            <strong>Board Findings & Decision:</strong><br>
                            ${feedbackNotes}
                        </div>

                        ${pillarScores && pillarScores.length > 0 ? `
                        <h4 style="margin-top: 24px; font-size: 14px;">Competency Pillar Assessment:</h4>
                        <ul style="font-size: 13px; padding-left: 20px; line-height: 1.8;">
                            ${pillarScores.map(p => `<li><strong>${p.pillarName}:</strong> ${p.score}/3 — ${p.gaps ? `<em>${p.gaps}</em>` : 'Compliant'}</li>`).join('')}
                        </ul>
                        ` : ''}

                        <p style="font-size: 14px;">To access your institutional dashboard or upload revised documentation, please click below:</p>
                        <a href="https://nicnigeria.org/portal/facility" class="btn">Open Facility Portal</a>
                    </div>
                    <div class="footer">
                        <p>National Institute of Caregivers • Regulatory Affairs & Accreditation</p>
                    </div>
                </div>
            </body>
            </html>
            `

            await resend.emails.send({
                from: 'NIC Board of Education <notifications@nicnigeria.org>',
                to: recipientEmail,
                subject,
                html: emailHtml
            })
        }

        revalidatePath('/admin/action-center')
        revalidatePath('/admin/registry/facilities')
        revalidatePath('/admin/inspections')

        return { success: true }

    } catch (err: any) {
        console.error("Error sending review decision:", err)
        return { error: err.message || 'Failed to process decision' }
    }
}
