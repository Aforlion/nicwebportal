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

interface NICRegistrationStatusEmailProps {
    fullName: string;
    status: 'approved' | 'denied' | 'action_required';
    reason?: string;
    nicId?: string;
    portalUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICRegistrationStatusEmail = ({
    fullName,
    status,
    reason,
    nicId,
    portalUrl = `${baseUrl}/login`,
}: NICRegistrationStatusEmailProps) => {
    const previewText = status === 'approved'
        ? "Congratulations! Your NIC registration has been approved."
        : status === 'denied'
            ? "Update regarding your NIC registration application."
            : "Action required for your NIC registration.";

    const statusTitle = {
        approved: "Registration Approved!",
        denied: "Registration Application Status",
        action_required: "Action Required: Registration Update",
    }[status];

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src={`${baseUrl}/logo.jpg`}
                            width="100"
                            height="100"
                            alt="NIC"
                            style={logo}
                        />
                    </Section>

                    <Heading style={h1}>{statusTitle}</Heading>

                    <Text style={text}>Dear {fullName},</Text>

                    {status === 'approved' && (
                        <Section>
                            <Text style={text}>
                                We are pleased to inform you that your registration with the <strong>National Institute of Caregivers (NIC)</strong> has been officially approved. You are now a verified member of the NIC professional registry.
                            </Text>
                            {nicId && (
                                <Section style={infoBox}>
                                    <Text style={infoLabel}>OFFICIAL NIC-ID</Text>
                                    <Text style={infoValue}>{nicId}</Text>
                                </Section>
                            )}
                            <Text style={text}>
                                You can now access your full member portal to download your digital membership card, access training materials, and track your CPD points.
                            </Text>
                            <Section style={btnContainer}>
                                <Link href={portalUrl} style={button}>Access Your Portal</Link>
                            </Section>
                        </Section>
                    )}

                    {status === 'action_required' && (
                        <Section>
                            <Text style={text}>
                                We have reviewed your registration application, but we require some additional information or corrections before we can proceed with your approval.
                            </Text>
                            {reason && (
                                <Section style={alertBox}>
                                    <Text style={alertTitle}>Required Action:</Text>
                                    <Text style={alertText}>{reason}</Text>
                                </Section>
                            )}
                            <Text style={text}>
                                Please log in to your portal as soon as possible to provide the missing details or re-upload any necessary documents.
                            </Text>
                            <Section style={btnContainer}>
                                <Link href={portalUrl} style={button}>Update Registration</Link>
                            </Section>
                        </Section>
                    )}

                    {status === 'denied' && (
                        <Section>
                            <Text style={text}>
                                Thank you for your interest in the National Institute of Caregivers. After a careful review of your application and submitted credentials, we regret to inform you that your registration application has been declined at this time.
                            </Text>
                            {reason && (
                                <Section style={reasonBox}>
                                    <Text style={reasonTitle}>Reason for decision:</Text>
                                    <Text style={reasonText}>{reason}</Text>
                                </Section>
                            )}
                            <Hr style={hr} />
                            <Text style={footerText}>
                                If you believe this decision was made in error or if you have upgraded your credentials, you may contact our support team at <Link href="mailto:support@nic.org" style={link}>support@nic.org</Link> for further clarification.
                            </Text>
                        </Section>
                    )}

                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>
                            National Institute of Caregivers (NIC)<br />
                            Professionalizing Caregiving in Nigeria
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NICRegistrationStatusEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
};

const logoContainer = {
    textAlign: 'center' as const,
    marginBottom: '30px',
};

const logo = {
    margin: '0 auto',
    borderRadius: '50%',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '20px',
};

const infoBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '25px',
    border: '1px solid #e5e7eb',
};

const infoLabel = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b7280',
    margin: '0 0 5px 0',
    letterSpacing: '1px',
};

const infoValue = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0284c7', // primary color
    margin: '0',
    fontFamily: 'monospace',
};

const alertBox = {
    backgroundColor: '#fffbeb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    borderLeft: '4px solid #f59e0b',
};

const alertTitle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#92400e',
    margin: '0 0 5px 0',
};

const alertText = {
    fontSize: '16px',
    color: '#b45309',
    margin: '0',
};

const reasonBox = {
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    borderLeft: '4px solid #ef4444',
};

const reasonTitle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#991b1b',
    margin: '0 0 5px 0',
};

const reasonText = {
    fontSize: '16px',
    color: '#dc2626',
    margin: '0',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
    backgroundColor: '#0284c7',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    textAlign: 'center' as const,
};

const footerText = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
};

const link = {
    color: '#0284c7',
    textDecoration: 'underline',
};
