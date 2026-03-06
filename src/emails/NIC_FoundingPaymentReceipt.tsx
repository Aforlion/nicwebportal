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

interface NICFoundingPaymentReceiptEmailProps {
    fullName: string;
    amount: string;
    reference: string;
    onboardingUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICFoundingPaymentReceiptEmail = ({
    fullName,
    amount,
    reference,
    onboardingUrl = `${baseUrl}/onboard/founding`,
}: NICFoundingPaymentReceiptEmailProps) => {
    const previewText = `Payment Confirmed: Your NIC Founding Membership Contribution`;

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

                    <Heading style={h1}>Contribution Received</Heading>

                    <Text style={text}>Dear {fullName},</Text>
                    <Text style={text}>
                        Thank you for your commitment to the National Institute of Caregivers. We have successfully received your founding membership contribution.
                    </Text>

                    <Section style={infoBox}>
                        <Text style={infoLabel}>TRANSACTION DETAILS</Text>
                        <div style={detailRow}>
                            <span style={detailLabel}>Amount:</span>
                            <span style={detailValue}>{amount}</span>
                        </div>
                        <div style={detailRow}>
                            <span style={detailLabel}>Reference:</span>
                            <span style={detailValue}>{reference}</span>
                        </div>
                        <div style={detailRow}>
                            <span style={detailLabel}>Status:</span>
                            <span style={detailValue}>Confirmed</span>
                        </div>
                    </Section>

                    <Text style={text}>
                        <strong>What's Next?</strong><br />
                        Your application is now moving to the final stage: <strong>KYC & Identity Verification</strong>. Our registry team will review your submitted documents to finalize your status as a "Pillar of the Institute".
                    </Text>

                    <Text style={text}>
                        If you haven't finished uploading your documents, please return to the onboarding portal to complete your profile.
                    </Text>

                    <Section style={btnContainer}>
                        <Link href={onboardingUrl} style={button}>Complete Onboarding</Link>
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

export default NICFoundingPaymentReceiptEmail;

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
    backgroundColor: '#fffdf0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '25px',
    border: '1px solid #fde68a',
};

const infoLabel = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#92400e',
    margin: '0 0 15px 0',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
};

const detailRow = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
};

const detailLabel = {
    color: '#78350f',
    fontSize: '14px',
};

const detailValue = {
    fontWeight: 'bold',
    color: '#451a03',
    fontSize: '14px',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
    backgroundColor: '#b45309', // gold/amber brown
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
