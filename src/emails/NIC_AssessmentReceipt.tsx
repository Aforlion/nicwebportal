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

interface NICAssessmentReceiptEmailProps {
    fullName: string;
    courseTitle: string;
    assessmentName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICAssessmentReceiptEmail = ({
    fullName,
    courseTitle,
    assessmentName,
}: NICAssessmentReceiptEmailProps) => (
    <Html>
        <Head />
        <Preview>Assessment Submission Receipt: {assessmentName}</Preview>
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
                <Heading style={h1}>Assessment Received</Heading>
                <Text style={text}>
                    Dear {fullName},<br /><br />
                    This email confirms that we have received your submission for <strong>{assessmentName}</strong> in the course <strong>{courseTitle}</strong>.
                </Text>

                <Section style={infoContainer}>
                    <Text style={infoText}>
                        <strong>Submission ID:</strong> Sub-{Math.random().toString(36).substring(2, 9).toUpperCase()}<br />
                        <strong>Date:</strong> {new Date().toLocaleString()}<br />
                        <strong>Status:</strong> Processing
                    </Text>
                </Section>

                <Text style={text}>
                    Our instructors will review your assessment shortly. You will receive a notification once your grade and feedback are available in the portal.
                </Text>

                <Hr style={hr} />
                <Text style={footer}>
                    Thank you for your dedication to professional caregiver training.
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Assessment Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICAssessmentReceiptEmail;

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

const infoContainer = {
    backgroundColor: '#f9f9f9',
    padding: '15px 40px',
    margin: '20px 40px',
    borderRadius: '8px',
};

const infoText = {
    color: '#333',
    fontSize: '14px',
    lineHeight: '22px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    padding: '0 40px',
};
