import {
    Body,
    Button,
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
} from '@react-email/components';
import * as React from 'react';

interface NICProfileUpdateRequestEmailProps {
    fullName: string;
    portalUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICProfileUpdateRequestEmail = ({
    fullName,
    portalUrl = `${baseUrl}/portal/member/profile`,
}: NICProfileUpdateRequestEmailProps) => (
    <Html>
        <Head />
        <Preview>Action Required: Please update your NIC profile information.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Img
                        src={`${baseUrl}/logo.jpg`}
                        width="64"
                        height="64"
                        alt="NIC Logo"
                        style={logo}
                    />
                </Section>

                <Heading style={h1}>Profile Update Required 📋</Heading>

                <Text style={textBody}>Dear <strong>{fullName}</strong>,</Text>
                <Text style={textBody}>
                    Our admin team has reviewed your NIC member profile and noticed that some of your
                    personal information may be incomplete or needs to be updated.
                </Text>

                <Section style={sectionsContainer}>
                    <Section style={warningBox}>
                        <Text style={warningText}>⚠️ Action Required — Please review your profile</Text>
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>Please check and update the following</Heading>
                        <Text style={stepText}>• Full legal name and contact details</Text>
                        <Text style={stepText}>• Date of birth and address</Text>
                        <Text style={stepText}>• Phone number</Text>
                        <Text style={stepText}>• Professional qualifications and years of experience</Text>
                        <Text style={stepText}>• Any other missing or incorrect information</Text>
                    </Section>

                    <Text style={bodyText}>
                        Please log in to your member portal and navigate to the <strong>Profile</strong> section
                        to make the necessary updates at your earliest convenience. Keeping your profile current
                        ensures your membership records are accurate and helps us serve you better.
                    </Text>

                    <Section style={ctaSection}>
                        <Button href={portalUrl} style={button}>
                            Update My Profile →
                        </Button>
                    </Section>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    If you have any questions, please reply to this email or contact the NIC Registry Office at{' '}
                    <Link href="mailto:support@nicnigeria.org" style={link}>
                        support@nicnigeria.org
                    </Link>
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Registry Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICProfileUpdateRequestEmail;

// ─── Styles ────────────────────────────────────────────────────────────────
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const header = {
    padding: '20px 40px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
    borderRadius: '8px',
};

const h1 = {
    color: '#0d3b66',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0 8px',
    padding: '0 40px',
};

const h3 = {
    color: '#0d3b66',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '12px 0 8px',
};

const textBody = {
    color: '#333',
    fontSize: '15px',
    lineHeight: '24px',
    textAlign: 'center' as const,
    padding: '0 40px',
    margin: '4px 0',
};

const bodyText = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '12px 0',
};

const sectionsContainer = {
    padding: '0 40px',
    marginTop: '20px',
};

const warningBox = {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '12px 20px',
    marginBottom: '16px',
    textAlign: 'center' as const,
};

const warningText = {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0',
};

const infoBlock = {
    padding: '16px 0',
    borderTop: '1px solid #f0f0f0',
};

const stepText = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '2px 0',
};

const ctaSection = {
    textAlign: 'center' as const,
    margin: '24px 0 16px',
};

const button = {
    backgroundColor: '#006B6B',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 36px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const link = {
    color: '#006B6B',
    textDecoration: 'underline',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    padding: '0 40px',
};
