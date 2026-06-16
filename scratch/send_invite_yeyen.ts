import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error("Missing environment variables in .env.local")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend = new Resend(RESEND_API_KEY)

async function run() {
    const email = "yeyenbassey@gmail.com"
    const fullName = "Bassey Mary Offiong"
    
    console.log(`Generating fresh recovery link for ${email}...`)
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
            redirectTo: `${APP_URL}/auth/callback?next=/reset-password`
        }
    })
    
    if (linkError) {
        console.error("Error generating link:", linkError)
        return
    }
    
    const actionLink = linkData?.properties?.action_link
    console.log("Generated Action Link:", actionLink)
    
    if (!actionLink) {
        console.error("No action link returned from Supabase")
        return
    }
    
    console.log("Rendering email html...")
    const html = await render(React.createElement(AlumniRefresherInvitationEmail, {
        fullName: fullName,
        loginUrl: actionLink
    }))
    
    console.log("Sending email via Resend...")
    const { data, error } = await resend.emails.send({
        from: 'NIC Registry Team <notifications@nicnigeria.org>',
        to: email,
        replyTo: 'support@nicnigeria.org',
        subject: 'ACTION REQUIRED: Upgrade Your NIC Certification (Special Alumni Offer)',
        html: html
    })
    
    if (error) {
        console.error("Failed to send email:", error)
    } else {
        console.log(`Successfully sent email to ${email}. ID: ${data?.id}`)
    }
}

run().catch(console.error)
