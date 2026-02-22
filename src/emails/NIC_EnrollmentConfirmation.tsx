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

interface NICEnrollmentEmailProps {
    fullName: string;
    courseTitle: string;
    courseUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const NICEnrollmentEmail = ({
    fullName,
    courseTitle,
    courseUrl,
}: NICEnrollmentEmailProps) => (
    <Html>
        <Head />
        <Preview>Enrollment Confirmed: {courseTitle}</Preview>
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
                <Heading style={h1}>Enrollment Successful!</Heading>
                <Text style={text}>
                    Dear {fullName},<br /><br />
                    Congratulations! You have successfully enrolled in <strong>{courseTitle}</strong>. Your payment has been confirmed, and you now have full access to the course materials.
                </Text>

                <Section style={buttonContainer}>
                    <Button style={button} href={courseUrl}>
                        Start Learning Now
                    </Button>
                </Section>

                <Section style={detailsContainer}>
                    <Heading as="h3" style={h3}>Course Details:</Heading>
                    <Text style={detailText}>
                        <strong>Course:</strong> {courseTitle}<br />
                        <strong>Platform:</strong> NIC Student Portal<br />
                        <strong>Access:</strong> Immediate
                    </Text>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    Happy learning! Use the button above to jump straight into your first lesson.
                </Text>
                <Text style={footer}>
                    If you have any trouble accessing your course, please reply to this email or visit our support center.
                </Text>
                <Text style={footer}>
                    Best Regards,<br />
                    <strong>NIC Academic Team</strong>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default NICEnrollmentEmail;

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

const detailsContainer = {
    backgroundColor: '#f9f9f9',
    padding: '20px 40px',
    margin: '20px 40px',
    borderRadius: '8px',
};

const detailText = {
    color: '#333',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '8px 0',
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
