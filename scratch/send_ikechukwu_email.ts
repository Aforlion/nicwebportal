process.env.NODE_ENV = "development"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { Resend } from "resend"

async function main() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        console.error("Missing RESEND_API_KEY")
        return
    }

    const resend = new Resend(apiKey)
    const email = "ikechukwuamalu2@gmail.com"
    const fullName = "Ikechukwu Amalu"
    const tempPassword = "NicStudent@2026!"
    const loginUrl = "https://nicnigeria.org/login"

    console.log(`Sending account recovery email to ${email}...`)

    const subject = "NIC Student Portal Account Credentials & Password Update"
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0d3b66;">National Institute of Caregivers (NIC)</h2>
            <h3>Account Access Updated</h3>
            <p>Dear ${fullName},</p>
            <p>Your NIC Student Portal account login issue has been resolved. You can now log into your student account using the credentials below:</p>

            <div style="background-color: #f4f6f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 3px 6px; border-radius: 4px; font-size: 15px;">${tempPassword}</code></p>
                <p style="margin: 5px 0;"><strong>NIC ID:</strong> NIC/MEM/2026/XGPES</p>
            </div>

            <p>Please log in and update your password under settings after signing in:</p>
            <p style="text-align: center; margin: 25px 0;">
                <a href="${loginUrl}" style="background-color: #0d3b66; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Student Portal</a>
            </p>

            <p style="font-size: 12px; color: #777; margin-top: 30px;">
                Best regards,<br/>
                <strong>NIC Technical Support Team</strong><br/>
                National Institute of Caregivers
            </p>
        </div>
    `

    const { data, error } = await resend.emails.send({
        from: 'NIC <notifications@nicnigeria.org>',
        to: email,
        subject: subject,
        html: html
    })

    if (error) {
        console.error("Resend error:", error)
    } else {
        console.log("✅ EMAIL DISPATCH SUCCESSFUL!", data)
    }
}

main().catch(console.error)
