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

interface NICFacilityWelcomeEmailProps {
    facilityName: string;
    ownerName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICFacilityWelcomeEmail = ({
    facilityName,
    ownerName,
}: NICFacilityWelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Institutional Registration Success: {facilityName}</Preview>
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
                    Thank you for registering <strong>{facilityName}</strong> with the <strong>National Institute of Caregivers (NIC) Care Partner Registry</strong>.
                </Text>

                <Section style={sectionsContainer}>
                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>Email Confirmation</Heading>
                        <Text style={stepText}>
                            Dear {ownerName}, we have received your institutional membership application. This email confirms your facility's initial registration.
                        </Text>
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>Verification & Certification</Heading>
                        <Text style={stepText}>
                            The NIC Registry Department will review your provided documents (CAC registration, TIN, etc.). We will contact you within 3-5 business days to finalize your certification.
                        </Text>
                    </Section>

                    <Section style={infoBlock}>
                        <Heading as="h3" style={h3}>Institutional Dashboard</Heading>
                        <Text style={stepText}>
                            Once verified, you will gain access to your institutional dashboard to manage staff links and verify caregiver credentials.
                        </Text>
                    </Section>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    If you have any questions regarding your facility registration, please contact our institutional support team at{' '}
                    <Link href="mailto:institutional@nicnigeria.org" style={link}>
                        institutional@nicnigeria.org
                    </Link>
                    .
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Institutional Registry Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICFacilityWelcomeEmail;

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

const stepText = {
    color: '#333',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '4px 0',
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
