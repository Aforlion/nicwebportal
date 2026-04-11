import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { Resend } from "resend"
import * as React from "react"
import { render } from "@react-email/render"
import { AlumniRefresherInvitationEmail } from "../src/emails/AlumniRefresherInvitation"

// Load env
dotenv.config({ path: ".env.local" })

const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org'

if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env.local")
    process.exit(1)
}

const resend = new Resend(RESEND_API_KEY)

async function sendTestEmails() {
    const targets = ["aforlion007@gmail.com", "victor.olusan@gmail.com"]
    const dummyLoginUrl = `${APP_URL}/portal/setup?token=TEST_TOKEN`
    
    console.log(`--- Sending Test Alumni Invitation Emails ---`)
    
    for (const email of targets) {
        try {
            console.log(`Sending to ${email}...`)
            
            const html = await render(React.createElement(AlumniRefresherInvitationEmail, {
                fullName: "Test Member (Alumni)",
                loginUrl: dummyLoginUrl
            }))
            
            const { data, error } = await resend.emails.send({
                from: 'NIC Registry Team <notifications@nicnigeria.org>',
                to: email,
                replyTo: 'support@nicnigeria.org',
                subject: 'ACTION REQUIRED: Upgrade Your NIC Certification (Special Alumni Offer)',
                html: html
            })
            
            if (error) {
                console.error(`Failed to send to ${email}:`, error)
            } else {
                console.log(`Successfully sent to ${email}`)
            }
        } catch (err) {
            console.error(`Error sending to ${email}:`, err)
        }
    }
    
    console.log(`--- Done! Check your inboxes. ---`)
}

sendTestEmails()
