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
} from '@react-email/components';
import * as React from 'react';

interface NICWelcomeEmailProps {
    fullName: string;
    temporaryPassword?: string;
    loginUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICWelcomeEmail = ({
    fullName,
    temporaryPassword,
    loginUrl = `${baseUrl}/login`,
}: NICWelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to the National Institute of Caregivers!</Preview>
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
                <Heading style={h1}>Registration Successful!</Heading>
                <Text style={textBody}>
                    Thank you for joining the <strong>National Institute of Caregivers (NIC)</strong>.
                </Text>

                <Section style={sectionsContainer}>
                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>{temporaryPassword ? "Temporary Access Details" : "Account Access"}</Heading>
                        <Text style={stepText}>
                            {temporaryPassword
                                ? "Your account has been created. Use the details below to access your portal for the first time:"
                                : "Your account has been successfully created. You can now access your portal using the link below:"
                            }
                        </Text>
                        <Section style={accessBox}>
                            <Text style={accessText}><strong>Login URL:</strong> <Link href={loginUrl} style={link}>{loginUrl}</Link></Text>
                            {temporaryPassword && (
                                <Text style={accessText}><strong>Temporary Password:</strong> <code style={code}>{temporaryPassword}</code></Text>
                            )}
                        </Section>
                        {temporaryPassword && (
                            <Text style={stepTextSmall}>
                                * Please change your password immediately after your first login for security purposes.
                            </Text>
                        )}
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>Verification Process</Heading>
                        <Text style={stepText}>
                            Our registry team will review your uploaded documents. You will receive notification once your professional profile and NIC-ID are ready.
                        </Text>
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>LMS Access</Heading>
                        <Text style={stepText}>
                            You can now log into the student portal to start your training programs and access your learning dashboard.
                        </Text>
                    </Section>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    If you have any questions, please contact our support team at{' '}
                    <Link href="mailto:support@nicnigeria.org" style={link}>
                        support@nicnigeria.org
                    </Link>
                    .
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Registry Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICWelcomeEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
    margin: '30px 0',
    padding: '0 40px',
};

const h3 = {
    color: '#0d3b66',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '10px 0',
};

const textBody = {
    color: '#333',
    fontSize: '18px',
    lineHeight: '26px',
    textAlign: 'center' as const,
    padding: '0 40px',
};

const sectionsContainer = {
    padding: '0 40px',
    marginTop: '20px',
};

const infoBlock = {
    padding: '16px 0',
    borderTop: '1px solid #f0f0f0',
};

const accessBox = {
    backgroundColor: '#f4f7fa',
    padding: '16px',
    borderRadius: '8px',
    margin: '12px 0',
    border: '1px solid #e1e8ed',
};

const accessText = {
    color: '#333',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '4px 0',
};

const code = {
    backgroundColor: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #d1d9e0',
    fontSize: '15px',
    fontFamily: 'monospace',
};

const stepText = {
    color: '#333',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '4px 0',
};

const stepTextSmall = {
    color: '#666',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '4px 0',
    fontStyle: 'italic',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const link = {
    color: '#0d3b66',
    textDecoration: 'underline',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    padding: '0 40px',
};
