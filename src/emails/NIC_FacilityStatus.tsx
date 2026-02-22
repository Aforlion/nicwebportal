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

interface NICFacilityStatusEmailProps {
    facilityName: string;
    ownerName: string;
    status: 'approved' | 'denied' | 'action_required';
    reason?: string;
    regNumber?: string;
    portalUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const NICFacilityStatusEmail = ({
    facilityName,
    ownerName,
    status,
    reason,
    regNumber,
    portalUrl = `${baseUrl}/portal/facility`,
}: NICFacilityStatusEmailProps) => {
    const previewText = status === 'approved'
        ? `Congratulations! ${facilityName} has been approved as an NIC partner.`
        : status === 'denied'
            ? `Status update for ${facilityName} registration.`
            : `Action required for ${facilityName} NIC registration.`;

    const statusTitle = {
        approved: "Institutional Registration Approved!",
        denied: "Institutional Registration Status",
        action_required: "Action Required: Institutional Review",
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

                    <Text style={text}>Dear {ownerName || 'Care Partner'},</Text>
                    <Text style={text}>
                        This email is to provide an update on the registration of <strong>{facilityName}</strong> with the National Institute of Caregivers.
                    </Text>

                    {status === 'approved' && (
                        <Section>
                            <Text style={text}>
                                We are pleased to announce that your institution has been officially approved as a recognized care partner. You are now authorized to register your staff, access institutional training programs, and be listed in our official directory of compliant care facilities.
                            </Text>
                            {regNumber && (
                                <Section style={infoBox}>
                                    <Text style={infoLabel}>INSTITUTIONAL REGISTRATION NO.</Text>
                                    <Text style={infoValue}>{regNumber}</Text>
                                </Section>
                            )}
                            <Text style={text}>
                                You can now access your corporate dashboard to manage your facility's profile and staff certifications.
                            </Text>
                            <Section style={btnContainer}>
                                <Link href={portalUrl} style={button}>Access Institutional Portal</Link>
                            </Section>
                        </Section>
                    )}

                    {status === 'action_required' && (
                        <Section>
                            <Text style={text}>
                                Our review team has examined your institutional application. However, we require additional documentation or a site inspection before we can finalize the approval.
                            </Text>
                            {reason && (
                                <Section style={alertBox}>
                                    <Text style={alertTitle}>Requested Action:</Text>
                                    <Text style={alertText}>{reason}</Text>
                                </Section>
                            )}
                            <Text style={text}>
                                Please log in to your dashboard to review the detailed requirements and submit the necessary updates.
                            </Text>
                            <Section style={btnContainer}>
                                <Link href={portalUrl} style={button}>Review Dashboard</Link>
                            </Section>
                        </Section>
                    )}

                    {status === 'denied' && (
                        <Section>
                            <Text style={text}>
                                Following a comprehensive review of your institutional application and supporting documentation, we regret to inform you that your registration as an NIC care partner has been declined at this time.
                            </Text>
                            {reason && (
                                <Section style={reasonBox}>
                                    <Text style={reasonTitle}>Reason for decision:</Text>
                                    <Text style={reasonText}>{reason}</Text>
                                </Section>
                            )}
                            <Hr style={hr} />
                            <Text style={footerText}>
                                If you wish to appeal this decision or require more details, please contact our Institutional Relations department at <Link href="mailto:institutions@nic.org" style={link}>institutions@nic.org</Link>.
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

export default NICFacilityStatusEmail;

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
