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

interface NICCertificateReadyEmailProps {
    fullName: string;
    courseTitle: string;
    certificateCode: string;
    certificateUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICCertificateReadyEmail = ({
    fullName,
    courseTitle,
    certificateCode,
    certificateUrl,
}: NICCertificateReadyEmailProps) => (
    <Html>
        <Head />
        <Preview>Congratulations! Your certificate for {courseTitle} is ready.</Preview>
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
                <Heading style={h1}>Congratulations, {fullName}!</Heading>
                <Text style={text}>
                    We are pleased to inform you that you have officially completed the <strong>{courseTitle}</strong> program and your certificate has been issued.
                </Text>

                <Section style={cardContainer}>
                    <Heading as="h3" style={h3}>Certificate Details:</Heading>
                    <Text style={cardText}>
                        <strong>Course:</strong> {courseTitle}<br />
                        <strong>Code:</strong> {certificateCode}<br />
                        <strong>Status:</strong> Issued & Verified
                    </Text>
                </Section>

                <Section style={buttonContainer}>
                    <Button style={button} href={certificateUrl}>
                        View Certificate
                    </Button>
                </Section>

                <Text style={text}>
                    You can share this link with employers or regulatory bodies to verify your professional standing. You can also download a PDF version of your certificate from the portal.
                </Text>

                <Hr style={hr} />
                <Text style={footer}>
                    This is a major milestone in your professional caregiver journey. Well done!
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Certification Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICCertificateReadyEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    backgroundImage: `url(${baseUrl}/coat-of-arm.png)`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '300px',
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

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'left' as const,
    padding: '0 40px',
};

const cardContainer = {
    backgroundColor: '#0d3b66',
    color: '#fff',
    padding: '20px 40px',
    margin: '20px 40px',
    borderRadius: '8px',
    textAlign: 'center' as const,
};

const cardText = {
    color: '#fff',
    fontSize: '15px',
    lineHeight: '24px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
    backgroundColor: '#f59e0b',
    borderRadius: '5px',
    color: '#000',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    width: '200px',
    padding: '14px 7px',
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
