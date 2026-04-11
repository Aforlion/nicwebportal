import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface AlumniRefresherInvitationEmailProps {
    fullName: string;
    loginUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const AlumniRefresherInvitationEmail = ({
    fullName,
    loginUrl,
}: AlumniRefresherInvitationEmailProps) => (
    <Html>
        <Head />
        <Preview>Upgrade Your NIC Certification & Join the Digital Portal</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Img
                        src={`${baseUrl}/logo.jpg`}
                        width="80"
                        height="80"
                        alt="NIC Logo"
                        style={logo}
                    />
                </Section>
                
                <Heading style={h1}>Exclusive Offer for NIC Alumni</Heading>
                
                <Text style={textBody}>
                    Hello <strong>{fullName}</strong>,
                </Text>
                
                <Text style={textBody}>
                    Our records show you are a graduate of the <strong>National Institute of Caregivers (NIC)</strong>. We are excited to invite you to our newly launched Digital Member Portal!
                </Text>

                <Section style={offerBox}>
                    <Heading as="h3" style={h3}>🎁 Special Alumni Benefit (₦25,000 Value)</Heading>
                    <Text style={textBodySmall}>
                        As a professional courtesy to our previous students, we are **WAIVING the ₦25,000 Associate Member Registration Fee** for you.
                    </Text>
                    
                    <Section style={detailsGrid}>
                        <Text style={detailItem}><strong>Program:</strong> Caregiver Refresher & Competency Update</Text>
                        <Text style={detailItem}><strong>Fee:</strong> Only ₦25,000 (Registration fee waived)</Text>
                        <Text style={detailItem}><strong>Deadline:</strong> April 30, 2026</Text>
                        <Text style={detailItem}><strong>Benefit:</strong> New Digital Smart Certificate + Registry Verification</Text>
                    </Section>

                    <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
                        <Button href={loginUrl} style={buttonStyle}>
                            Claim Your Waiver & Enroll Now
                        </Button>
                    </Section>
                    
                    <Text style={urgentNote}>
                        ⚠️ <strong>Note:</strong> This waiver of the registration fee is only available if you enroll before the end of April 2026.
                    </Text>
                </Section>

                <Section style={infoSection}>
                    <Heading as="h3" style={h3Small}>Why Upgrade to Digital?</Heading>
                    <ul style={list}>
                        <li style={listItem}><strong>Smart Certificate:</strong> Access your credentials anywhere on your mobile phone.</li>
                        <li style={listItem}><strong>Registry Status:</strong> Instant verification for employers on the National Registry.</li>
                        <li style={listItem}><strong>Professional Edge:</strong> Stay updated with the latest 2026 caregiving standards.</li>
                    </ul>
                </Section>

                <Hr style={hr} />
                
                <Text style={footer}>
                    If you have any questions, please contact our support team at{' '}
                    <Link href="mailto:support@nicnigeria.org" style={link}>
                        support@nicnigeria.org
                    </Link>
                </Text>
                
                <Text style={footer}>
                    Official communication from the<br />
                    <strong>NIC Registry Team</strong><br />
                    National Institute of Caregivers
                </Text>
            </Container>
        </Body>
    </Html>
);

export default AlumniRefresherInvitationEmail;

const main = {
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.97)), url(${baseUrl}/coat-of-arm.png)`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '350px',
    margin: '0 auto',
    padding: '40px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
};

const header = {
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const logo = {
    margin: '0 auto',
};

const h1 = {
    color: '#0d3b66',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '20px 0',
};

const h3 = {
    color: '#0d3b66',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0 0 16px',
    textAlign: 'center' as const,
};

const h3Small = {
    color: '#0d3b66',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 10px',
};

const textBody = {
    color: '#334155',
    fontSize: '17px',
    lineHeight: '26px',
    marginBottom: '16px',
};

const textBodySmall = {
    color: '#1e293b',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center' as const,
};

const offerBox = {
    backgroundColor: '#fff7ed',
    padding: '30px',
    borderRadius: '16px',
    margin: '24px 0',
    border: '2px dashed #f97316',
};

const detailsGrid = {
    marginTop: '20px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    borderLeft: '5px solid #f97316',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const detailItem = {
    margin: '10px 0',
    fontSize: '16px',
    color: '#1e293b',
};

const urgentNote = {
    marginTop: '20px',
    fontSize: '14px',
    color: '#c2410c',
    textAlign: 'center' as const,
};

const buttonStyle = {
    backgroundColor: '#0d3b66',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
};

const infoSection = {
    padding: '20px 0',
};

const list = {
    paddingLeft: '20px',
    margin: '0',
};

const listItem = {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '12px',
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '30px 0',
};

const link = {
    color: '#0d3b66',
    textDecoration: 'underline',
};

const footer = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center' as const,
    marginTop: '10px',
};
