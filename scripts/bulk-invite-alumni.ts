import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"
import { Resend } from "resend"
import * as React from "react"
import { render } from "@react-email/render"
import { AlumniRefresherInvitationEmail } from "../src/emails/AlumniRefresherInvitation"

// Load env
dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'
const DRY_RUN = false; // Set to false to actually send emails and create users

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error("Missing environment variables in .env.local")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend = new Resend(RESEND_API_KEY)

function parseCSVLine(line: string) {
    const result = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(cur)
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

function parseAlumniFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const alumniList: { name: string, email: string, certCode: string }[] = []
    
    let currentHeaders: string[] = []
    
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        
        // Detect header row
        if (trimmed.startsWith('S/N,')) {
            currentHeaders = trimmed.split(',').map(h => h.trim().toLowerCase())
            continue
        }
        
        if (currentHeaders.length === 0) continue

        const parts = parseCSVLine(trimmed)
        const entry: any = {}
        
        currentHeaders.forEach((header, index) => {
            if (parts[index] !== undefined) {
                entry[header] = parts[index].trim()
            }
        })
        
        const name = entry.name
        const email = entry.email
        const certCode = entry['cert. code'] || entry['cert. code / purpose'] || ''
        
        if (name && email && email.includes('@')) {
            alumniList.push({ name, email, certCode })
        }
    }
    
    return alumniList
}

async function runCampaign() {
    const ALUMNI_FILE = "C:\\Users\\Olatunji\\Desktop\\NIC Old Members.txt"
    console.log(`--- Starting Alumni Refresh Campaign (DRY_RUN: ${DRY_RUN}) ---`)
    
    const alumni = parseAlumniFile(ALUMNI_FILE)
    console.log(`Found ${alumni.length} valid entries with emails in file.`)
    
    // Check for duplicates in the file itself (case insensitive email)
    const uniqueAlumniMap = new Map<string, typeof alumni[0]>()
    alumni.forEach(a => uniqueAlumniMap.set(a.email.toLowerCase(), a))
    const uniqueAlumni = Array.from(uniqueAlumniMap.values())
    
    console.log(`After removing duplicates: ${uniqueAlumni.length} unique candidates.`)
    
    if (DRY_RUN) {
        console.log("\n--- DRY RUN PREVIEW (First 5 candidates) ---")
        uniqueAlumni.slice(0, 5).forEach(p => console.log(`- ${p.name} <${p.email}> (Cert: ${p.certCode})`))
        console.log("-------------------------------------------\n")
        console.log("DRY RUN: No emails sent. Set DRY_RUN = false and run again to execute.")
        return;
    }

    for (const person of uniqueAlumni) {
        try {
            console.log(`Processing: ${person.name} (${person.email})...`)
            
            // 1. Generate the recovery/setup link
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: person.email,
                options: {
                    redirectTo: `${APP_URL}/auth/callback?next=/reset-password`
                }
            })
            
            if (linkError) {
                const message = linkError.message.toLowerCase()
                if (message.includes('email not found') || message.includes('user not found')) {
                    console.log(`User not found for ${person.email}, creating portal profile...`)
                    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                        email: person.email,
                        email_confirm: true,
                        user_metadata: { full_name: person.name }
                    })
                    
                    if (createError) {
                        console.error(`Failed to create user ${person.email}:`, createError)
                        continue
                    }
                    
                    console.log(`User created for ${person.email}. Generating setup link...`)
                    const { data: retryLinkData, error: retryLinkError } = await supabase.auth.admin.generateLink({
                        type: 'recovery',
                        email: person.email,
                        options: { redirectTo: `${APP_URL}/auth/callback?next=/reset-password` }
                    })
                    
                    if (retryLinkError) {
                        console.error(`Failed after creation for ${person.email}:`, retryLinkError)
                        continue
                    }
                    
                    await sendCampaignEmail(person, retryLinkData?.properties?.action_link || `${APP_URL}/login`)
                } else {
                    console.error(`Unexpected auth error for ${person.email}:`, linkError)
                    continue
                }
            } else {
                await sendCampaignEmail(person, linkData?.properties?.action_link || `${APP_URL}/login`)
            }
            
            await new Promise(r => setTimeout(r, 500))
            
        } catch (err) {
            console.error(`Unexpected error for ${person.email}:`, err)
        }
    }
    
    console.log(`--- Campaign Completed ---`)
}

async function sendCampaignEmail(person: { name: string, email: string }, loginUrl: string) {
    const html = await render(React.createElement(AlumniRefresherInvitationEmail, {
        fullName: person.name,
        loginUrl: loginUrl
    }))
    
    const { data, error } = await resend.emails.send({
        from: 'NIC Registry Team <notifications@nicnigeria.org>',
        to: person.email,
        replyTo: 'support@nicnigeria.org',
        subject: 'ACTION REQUIRED: Upgrade Your NIC Certification (Special Alumni Offer)',
        html: html
    })
    
    if (error) {
        console.error(`Failed to send email to ${person.email}:`, error)
    } else {
        console.log(`Successfully invited ${person.email}`)
    }
}

runCampaign()
