import * as React from 'react';
import { Button, Text, Section, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface WelcomeEmailProps {
    schoolName: string;
    adminName: string;
    loginUrl: string;
    customHeading?: string;
    customBody?: string;
}

export const WelcomeEmail = ({
    schoolName,
    adminName,
    loginUrl,
    customHeading,
    customBody,
}: WelcomeEmailProps) => {
    return (
        <EmailLayout
            previewText={`Welcome to EDucore, ${schoolName}!`}
            schoolName={schoolName}
            heading={customHeading || "Welcome to your new School Management System"}
        >
            <Text style={text}>Dear <strong>{adminName}</strong>,</Text>

            {customBody ? (
                <Text style={text} dangerouslySetInnerHTML={{ __html: customBody.replace(/\n/g, '<br/>') }} />
            ) : (
                <Text style={text}>
                    Congratulations! Your school, <strong>{schoolName}</strong>, has been successfully registered on EDucore.
                    We are thrilled to have you on board.
                </Text>
            )}

            <Text style={text}>
                EDucore is designed to simplify your administrative tasks, from CBC assessment tracking to generating complex report cards instantly.
            </Text>

            <Section style={btnContainer}>
                <Button style={button} href={loginUrl}>
                    Log In to Dashboard
                </Button>
            </Section>

            <Text style={text}>
                Or copy and paste this link into your browser:
                <br />
                <a href={loginUrl} style={link}>{loginUrl}</a>
            </Text>

            <Hr style={hr} />

            <Text style={subText}>
                <strong>Next Steps:</strong> Once you log in, we recommend completing your school profile and setting up your first academic term.
            </Text>
        </EmailLayout>
    );
};

const text = {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '20px',
};

const subText = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '22px',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#1e3a8a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '12px 24px',
    display: 'inline-block',
    boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)',
};

const link = {
    color: '#1e3a8a',
    fontSize: '14px',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '32px 0 24px',
};

export default WelcomeEmail;
