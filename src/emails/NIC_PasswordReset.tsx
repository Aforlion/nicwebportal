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

interface NICPasswordResetEmailProps {
    fullName?: string;
    resetUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICPasswordResetEmail = ({
    fullName,
    resetUrl,
}: NICPasswordResetEmailProps) => (
    <Html>
        <Head />
        <Preview>Reset your NIC Password</Preview>
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
                <Heading style={h1}>Reset your NIC password</Heading>
                <Text style={text}>
                    {fullName ? `Hi ${fullName},` : 'Hello,'}<br /><br />
                    We received a request to reset the password for your account on the National Institute of Caregivers (NIC) portal.
                </Text>

                <Section style={buttonContainer}>
                    <Button style={button} href={resetUrl}>
                        Reset Password
                    </Button>
                </Section>

                <Text style={detailsText}>
                    This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
                </Text>

                <Hr style={hr} />
                <Text style={footer}>
                    If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br />
                    <Link href={resetUrl} style={link}>
                        {resetUrl}
                    </Link>
                </Text>
                <Text style={footer}>
                    For your security, never share this link with anyone.
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC IT Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICPasswordResetEmail;

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

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'left' as const,
    padding: '0 40px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
    backgroundColor: '#0d3b66',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    width: '200px',
    padding: '14px 7px',
};

const detailsText = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '22px',
    padding: '0 40px',
    textAlign: 'center' as const,
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
