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

interface NICAdmissionConfirmationEmailProps {
    fullName: string;
    coursesUrl?: string;
    loginUrl?: string;
    resetUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICAdmissionConfirmationEmail = ({
    fullName,
    coursesUrl = `${baseUrl}/portal/student/courses`,
    loginUrl = `${baseUrl}/login`,
    resetUrl,
}: NICAdmissionConfirmationEmailProps) => (
    <Html>
        <Head />
        <Preview>Congratulations! Your NIC student application has been approved.</Preview>
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

                <Heading style={h1}>You've Been Admitted! 🎓</Heading>

                <Text style={textBody}>
                    Dear <strong>{fullName}</strong>,
                </Text>
                <Text style={textBody}>
                    We are delighted to inform you that your student application to the{' '}
                    <strong>National Institute of Caregivers (NIC)</strong> has been{' '}
                    <strong style={{ color: '#059669' }}>approved</strong>. Welcome to NIC!
                </Text>

                <Section style={sectionsContainer}>
                    <Section style={successBox}>
                        <Text style={successText}>✅ Your account is now Active</Text>
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>📋 What to do next</Heading>
                        {resetUrl ? (
                            <>
                                <Text style={stepText}>1. Finalize your account by setting your password</Text>
                                <Text style={stepText}>2. Browse our available courses and programmes</Text>
                                <Text style={stepText}>3. Enrol in a course to begin your journey</Text>
                            </>
                        ) : (
                            <>
                                <Text style={stepText}>1. Log in to your student portal</Text>
                                <Text style={stepText}>2. Browse our available courses and programmes</Text>
                                <Text style={stepText}>3. Enrol in a course to begin your professional caregiver journey</Text>
                                <Text style={stepText}>4. Complete your profile with updated personal information</Text>
                            </>
                        )}
                    </Section>

                    <Section style={ctaSection}>
                        <Button href={resetUrl || coursesUrl} style={button}>
                            {resetUrl ? "Set Up Your Account & Password →" : "Browse & Register for a Course →"}
                        </Button>
                    </Section>

                    <Text style={orText}>
                        Already know which course to take?{' '}
                        <Link href={loginUrl} style={link}>Log in to your portal</Link>
                    </Text>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    If you have any questions, contact us at{' '}
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

export default NICAdmissionConfirmationEmail;

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

const sectionsContainer = {
    padding: '0 40px',
    marginTop: '20px',
};

const successBox = {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '12px 20px',
    marginBottom: '16px',
    textAlign: 'center' as const,
};

const successText = {
    color: '#065f46',
    fontSize: '15px',
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

const orText = {
    color: '#6b7280',
    fontSize: '13px',
    textAlign: 'center' as const,
    margin: '8px 0 0',
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
