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

interface NICAssessmentResultEmailProps {
    fullName: string;
    courseTitle: string;
    assessmentName: string;
    passed: boolean;
    score: number;
    passingScore: number;
    feedback?: string;
    courseId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';

export const NICAssessmentResultEmail = ({
    fullName,
    courseTitle,
    assessmentName,
    passed,
    score,
    passingScore,
    feedback,
    courseId
}: NICAssessmentResultEmailProps) => {
    const statusText = passed ? "Passed" : "Not Passed";
    const statusColor = passed ? "#16a34a" : "#dc2626";
    const statusBg = passed ? "#f0fdf4" : "#fef2f2";
    const courseUrl = `${baseUrl}/portal/student/courses/${courseId}`;

    return (
        <Html>
            <Head />
            <Preview>Assessment Result: {assessmentName} ({statusText})</Preview>
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
                    <Heading style={h1}>Assessment Evaluation Result</Heading>
                    <Text style={text}>
                        Dear {fullName},<br /><br />
                        Your submission for <strong>{assessmentName}</strong> in <strong>{courseTitle}</strong> has been evaluated.
                    </Text>

                    <Section style={{ ...statusContainer, backgroundColor: statusBg, borderColor: statusColor }}>
                        <Text style={{ ...statusTitle, color: statusColor }}>
                            Status: {passed ? "PASSED 🎉" : "REQUIRES RETAKE"}
                        </Text>
                        <Text style={scoreText}>
                            Your Score: <strong>{score}%</strong> (Passing Mark: {passingScore}%)
                        </Text>
                    </Section>

                    {feedback && (
                        <Section style={feedbackContainer}>
                            <Text style={feedbackHeader}>Evaluator / AI Feedback:</Text>
                            <Text style={feedbackBody}>{feedback}</Text>
                        </Section>
                    )}

                    <Text style={text}>
                        {passed ? (
                            "Great job! You have passed this assessment and satisfied the module requirements."
                        ) : (
                            "Do not worry! You can return to the course portal anytime to review your course materials and retake this assessment to earn your passing grade."
                        )}
                    </Text>

                    <Section style={btnContainer}>
                        <Link style={{ ...button, backgroundColor: passed ? '#0d3b66' : '#dc2626' }} href={courseUrl}>
                            {passed ? "Continue Course" : "Retake Assessment Now"}
                        </Link>
                    </Section>

                    <Hr style={hr} />
                    <Text style={footer}>
                        National Institute of Caregivers — Professional Development Portal
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default NICAssessmentResultEmail;

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
    margin: '20px 0',
    padding: '0 40px',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'left' as const,
    padding: '0 40px',
};

const statusContainer = {
    padding: '16px 24px',
    margin: '20px 40px',
    borderRadius: '8px',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid' as const,
};

const statusTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
};

const scoreText = {
    fontSize: '15px',
    color: '#333',
    margin: '0',
};

const feedbackContainer = {
    backgroundColor: '#f8fafc',
    padding: '16px 24px',
    margin: '16px 40px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
};

const feedbackHeader = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 6px 0',
};

const feedbackBody = {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '22px',
    margin: '0',
    whiteSpace: 'pre-line' as const,
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '28px 0',
};

const button = {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 28px',
    borderRadius: '6px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '24px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    padding: '0 40px',
};
