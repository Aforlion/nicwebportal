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
} from "@react-email/components";
import * as React from "react";

interface NICFoundingWelcomeEmailProps {
    fullName: string;
    portalUrl: string;
}

export const NICFoundingWelcomeEmail = ({
    fullName = "Distinguished Founder",
    portalUrl = "https://nicnigeria.org/login",
}: NICFoundingWelcomeEmailProps) => {
    const previewText = `Welcome to the NIC: Your Founding Membership is now active.`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Img
                            src="https://pnbzayzlyvquqrvayuea.supabase.co/storage/v1/object/public/branding/nic-logo-gold.png"
                            width="120"
                            height="auto"
                            alt="NIC Logo"
                            style={logo}
                        />
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>Welcome, Founding Member</Heading>
                        <Text style={text}>
                            Dear <strong>{fullName}</strong>,
                        </Text>
                        <Text style={text}>
                            It is with great pride that we officially welcome you as a <strong>Founding Member</strong> of the <strong>National Institute of Caregivers (NIC)</strong>.
                        </Text>
                        <Text style={text}>
                            Your onboarding process is now complete, and your status as a pillar of this institute has been formalised in our National Registry.
                        </Text>
                        <Text style={text}>
                            You can now access the Member Portal to download your digital ID, view your certification status, and engage with the institute's resources.
                        </Text>

                        <Section style={btnContainer}>
                            <Link style={button} href={portalUrl}>
                                Access Member Portal
                            </Link>
                        </Section>

                        <Text style={text}>
                            <strong>What happens next:</strong>
                            <ul style={list}>
                                <li><strong>Verification</strong>: Our registrar will conduct a final review of your uploaded KYC documents.</li>
                                <li><strong>ID Card</strong>: Your physical membership card will be processed and sent to your registered address.</li>
                                <li><strong>Engagement</strong>: You will receive notifications regarding upcoming Governing Council sessions and consultative meetings.</li>
                            </ul>
                        </Text>

                        <Hr style={hr} />

                        <Text style={text}>
                            Thank you for your commitment to elevating caregiving standards in Nigeria. Your contribution today secures the profession for generations to come.
                        </Text>

                        <Text style={signature}>
                            Warm regards,<br />
                            <strong>The Registrar</strong><br />
                            National Institute of Caregivers
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} National Institute of Caregivers. All rights reserved. <br />
                            Abuja, Nigeria.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NICFoundingWelcomeEmail;

const main = {
    backgroundColor: "#f4f7f9",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "580px",
};

const header = {
    padding: "24px",
    textAlign: "center" as const,
    backgroundColor: "#1e293b", // Slate 900
    borderRadius: "12px 12px 0 0",
};

const logo = {
    margin: "0 auto",
};

const content = {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "0 0 12px 12px",
    border: "1px solid #e2e8f0",
};

const h1 = {
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
    fontFamily: "serif",
};

const text = {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "16px 0",
};

const list = {
    paddingLeft: "20px",
    marginTop: "8px",
};

const btnContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#1e293b", // Slate 900
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "16px 32px",
    boxShadow: "0 4px 6px -1px rgba(30, 41, 59, 0.2)",
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "24px 0",
};

const signature = {
    color: "#1e293b",
    fontSize: "16px",
    margin: "32px 0 0",
};

const footer = {
    padding: "24px",
    textAlign: "center" as const,
};

const footerText = {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "18px",
};
