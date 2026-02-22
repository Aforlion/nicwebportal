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

interface NICFoundingInvitationEmailProps {
    fullName: string;
    onboardingUrl: string;
}

export const NICFoundingInvitationEmail = ({
    fullName = "Distinguished Founder",
    onboardingUrl = "https://nicnigeria.org/onboard/founding",
}: NICFoundingInvitationEmailProps) => {
    const previewText = `Official Invitation: Become a Founding Member of the National Institute of Caregivers.`;

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
                        <Heading style={h1}>Formal Invitation: Founding Membership</Heading>
                        <Text style={text}>
                            Dear <strong>{fullName}</strong>,
                        </Text>
                        <Text style={text}>
                            On behalf of the Governing Council of the <strong>National Institute of Caregivers (NIC)</strong>, it is my distinct honor to formally invite you to join us as a <strong>Founding Member</strong>.
                        </Text>
                        <Text style={text}>
                            As a Founding Member, your leadership and support will be instrumental in shaping the future of caregiving in Nigeria. This invitation recognizes your significant standing and commitment to the profession.
                        </Text>
                        <Text style={text}>
                            To formalize your membership, complete your profile, and fulfill the mandatory recapitalization requirements, please proceed to our secure onboarding portal using the button below:
                        </Text>

                        <Section style={btnContainer}>
                            <Link style={button} href={onboardingUrl}>
                                Complete My Onboarding
                            </Link>
                        </Section>

                        <Text style={footerLink}>
                            Or copy and paste this URL into your browser: <br />
                            <Link href={onboardingUrl} style={link}>
                                {onboardingUrl}
                            </Link>
                        </Text>

                        <Hr style={hr} />

                        <Text style={subText}>
                            <strong>Why Founding Membership matters:</strong>
                            <ul style={list}>
                                <li>Direct participation in the formation of national caregiving standards.</li>
                                <li>Permanent recognition on the NIC Roll of Honor.</li>
                                <li>Priority access to institute leadership and consultative councils.</li>
                            </ul>
                        </Text>

                        <Text style={text}>
                            We look forward to welcoming you officially as a Pillar of the Institute.
                        </Text>

                        <Text style={signature}>
                            Yours sincerely,<br />
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

export default NICFoundingInvitationEmail;

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

const subText = {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "22px",
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
    backgroundColor: "#c2410c", // Orange 700 (Gold-ish/Premium)
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "16px 32px",
    boxShadow: "0 4px 6px -1px rgba(194, 65, 12, 0.2)",
};

const link = {
    color: "#c2410c",
    textDecoration: "underline",
};

const footerLink = {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center" as const,
    marginTop: "12px",
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
