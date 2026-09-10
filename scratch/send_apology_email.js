const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('RESEND_API_KEY missing');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function sendApologyEmail() {
  const recipient = 'sunmolaflorence669@gmail.com';
  const fullName = 'Sunmola Florence oluwakemisola';
  const nicId = 'NIC/MEM/2026/OPJQ9';
  const certCode = 'NIC-2026-3CQ9F';

  console.log(`=== SENDING APOLOGY & CONFIRMATION EMAIL TO ${recipient} ===`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Important Update Regarding Your NIC Account</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
        .logo-title { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 10px; }
        .subtitle { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 24px 0; line-height: 1.6; font-size: 15px; }
        .badge-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
        .badge-title { font-weight: bold; color: #166534; font-size: 14px; margin-bottom: 8px; }
        .badge-detail { font-size: 13px; color: #15803d; font-weight: 600; }
        .button { display: inline-block; background-color: #d97706; color: #ffffff !important; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-top: 16px; text-align: center; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="subtitle">Official Communication</div>
          <div class="logo-title">National Institute of Caregivers</div>
        </div>

        <div class="content">
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We are writing to officially update you following a routine portal review and system audit of your account records with the National Institute of Caregivers (NIC Nigeria).</p>

          <div class="badge-box">
            <div class="badge-title">✓ Verified Active Account Credentials</div>
            <div class="badge-detail">Student Member ID: <strong>${nicId}</strong></div>
            <div class="badge-detail">Completed Course: <strong>Dementia</strong></div>
            <div class="badge-detail">Official Certificate Code: <strong>${certCode}</strong></div>
          </div>

          <p>We want to sincerely apologize for any confusion or delay experienced during our portal data synchronization audit. We have completely reconciled all your portal records, and we are pleased to confirm that your <strong>Student Membership</strong> and your official <strong>Certificate of Completion for Dementia Care</strong> remain <strong>100% valid, active, and fully recognized</strong> on the national registry board.</p>

          <p>You can access your portal dashboard anytime to view your digital credentials, download your verified certificate, or explore further professional development courses.</p>

          <div style="text-align: center;">
            <a href="https://nicnigeria.org/certificates/${certCode}" class="button">View Official Certificate</a>
          </div>

          <p style="margin-top: 28px;">If you ever have any questions or require support, please feel free to reach out directly to our help desk.</p>

          <p>Thank you for your dedication to professional caregiving excellence!</p>

          <p style="margin-top: 24px;">
            Warm regards,<br>
            <strong>Olatunji Joel</strong><br>
            <span style="color: #64748b; font-size: 13px;">Executive Director, Programmes<br>National Institute of Caregivers</span>
          </p>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} National Institute of Caregivers (NIC Nigeria). All rights reserved.<br>
          Official Website: <a href="https://nicnigeria.org" style="color: #64748b;">www.nicnigeria.org</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: 'National Institute of Caregivers <notifications@nicnigeria.org>',
    to: recipient,
    subject: 'Important Update Regarding Your NIC Portal Account & Certificate Status',
    html: htmlContent
  });

  if (error) {
    console.error('Failed to send apology email:', error);
  } else {
    console.log('Apology email successfully dispatched to Sunmola Florence:', JSON.stringify(data, null, 2));
  }
}

sendApologyEmail().catch(console.error);
