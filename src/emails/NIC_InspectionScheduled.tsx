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

interface NICInspectionScheduledEmailProps {
    facilityName: string;
    ownerName: string;
    scheduledDate: string;
    scheduledTime: string;
    inspectorName?: string;
    portalUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICInspectionScheduledEmail = ({
    facilityName,
    ownerName,
    scheduledDate,
    scheduledTime,
    inspectorName = "NIC Regional Inspector",
    portalUrl = `${baseUrl}/portal/facility`,
}: NICInspectionScheduledEmailProps) => {
    const previewText = `Scheduled: NIC Compliance Inspection for ${facilityName}`;

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

                    <Heading style={h1}>Compliance Inspection Scheduled</Heading>

                    <Text style={text}>Dear {ownerName || 'Care Partner'},</Text>
                    <Text style={text}>
                        This is to inform you that a formal compliance inspection has been scheduled for <strong>{facilityName}</strong> as part of the National Institute of Caregivers (NIC) institutional certification process.
                    </Text>

                    <Section style={infoBox}>
                        <div style={infoGrid}>
                            <div style={infoColumn}>
                                <Text style={infoLabel}>DATE</Text>
                                <Text style={infoValue}>{scheduledDate}</Text>
                            </div>
                            <div style={infoColumn}>
                                <Text style={infoLabel}>TIME</Text>
                                <Text style={infoValue}>{scheduledTime}</Text>
                            </div>
                        </div>
                        <Hr style={innerHr} />
                        <Text style={infoLabel}>ASSIGNED INSPECTOR</Text>
                        <Text style={infoValue}>{inspectorName}</Text>
                    </Section>

                    <Text style={text}>
                        <strong>What to prepare:</strong>
                        <ul style={list}>
                            <li style={listItem}>Ensure all staff registration documents are available.</li>
                            <li style={listItem}>Provide access to care facility grounds and administrative offices.</li>
                            <li style={listItem}>Have your CAC and TIN registration certificates ready for physical verification.</li>
                        </ul>
                    </Text>

                    <Text style={text}>
                        Please log in to your institutional portal to confirm receipt of this schedule or to request a reschedule if there is a critical conflict.
                    </Text>

                    <Section style={btnContainer}>
                        <Link href={portalUrl} style={button}>View Inspection Details</Link>
                    </Section>

                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>
                            National Institute of Caregivers (NIC)<br />
                            Registry & Compliance Department<br />
                            Professionalizing Caregiving in Nigeria
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NICInspectionScheduledEmail;

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
    padding: '24px',
    marginBottom: '25px',
    border: '1px solid #e5e7eb',
};

const infoGrid = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
};

const infoColumn = {
    width: '48%',
};

const infoLabel = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#6b7280',
    margin: '0 0 5px 0',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
};

const infoValue = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0284c7',
    margin: '0',
};

const innerHr = {
    borderColor: '#e5e7eb',
    margin: '15px 0',
};

const list = {
    paddingLeft: '20px',
    marginTop: '0',
};

const listItem = {
    marginBottom: '8px',
    color: '#4b5563',
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
