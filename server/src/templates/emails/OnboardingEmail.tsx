import * as React from 'react';
import { Button, Text, Section, Heading, Hr, Row, Column } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface OnboardingEmailProps {
    schoolName: string;
    adminName: string;
    loginUrl: string;
    customHeading?: string;
    customBody?: string;
}

export const OnboardingEmail = ({
    schoolName,
    adminName,
    loginUrl,
    customHeading,
    customBody,
}: OnboardingEmailProps) => {
    return (
        <EmailLayout
            previewText="Getting Started with EDucore - Your Setup Guide"
            schoolName={schoolName}
            heading={customHeading || "Let's get your school set up"}
        >
            <Text style={text}>
                Hello <strong>{adminName}</strong>,
            </Text>

            {customBody ? (
                <Text style={text} dangerouslySetInnerHTML={{ __html: customBody.replace(/\n/g, '<br/>') }} />
            ) : (
                <>
                    <Text style={text}>
                        To get the most out of EDucore, we recommend following this quick setup guide.
                        A properly configured system ensures accurate reporting and grading from day one.
                    </Text>

                    <Section style={stepsContainer}>
                        <Step
                            number="1"
                            title="Configure Academics"
                            description="Go to 'Academic Settings' to define your Terms, Grading Systems, and Class Streams."
                        />
                        <Step
                            number="2"
                            title="Add Your People"
                            description="Navigate to 'User Management' to invite Teachers and add Students. You can bulk import students via Excel."
                        />
                        <Step
                            number="3"
                            title="Set Up Curriculum"
                            description="Assign subjects (Learning Areas) to classes so teachers can start entering marks."
                        />
                    </Section>
                </>
            )}

            <Section style={btnContainer}>
                <Button style={button} href={loginUrl}>
                    Start Setup Now
                </Button>
            </Section>

            <Hr style={hr} />

            <Text style={subText}>
                <strong>Need help?</strong> Our support team is ready to assist you with data migration or system configuration.
                Just reply to this email.
            </Text>
        </EmailLayout>
    );
};

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <Row style={stepRow}>
        <Column style={numberCol}>
            <Section style={circle}>
                <Text style={numberText}>{number}</Text>
            </Section>
        </Column>
        <Column>
            <Heading as="h3" style={stepTitle}>{title}</Heading>
            <Text style={stepDescription}>{description}</Text>
        </Column>
    </Row>
);

const text = {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '24px',
};

const stepsContainer = {
    marginTop: '20px',
    marginBottom: '20px',
};

const stepRow = {
    marginBottom: '24px',
};

const numberCol = {
    width: '48px',
    paddingRight: '16px',
    verticalAlign: 'top' as const,
};

const circle = {
    width: '32px',
    height: '32px',
    backgroundColor: '#eff6ff',
    borderRadius: '50%',
    border: '1px solid #1e3a8a',
    textAlign: 'center' as const,
};

const numberText = {
    color: '#1e3a8a',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '2px', // Visual centering adjustment
    marginBottom: '0',
};

const stepTitle = {
    color: '#1e293b', // darker slate
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '0',
    marginBottom: '8px',
};

const stepDescription = {
    color: '#64748b',
    fontSize: '15px',
    lineHeight: '24px',
    marginTop: '0',
    marginBottom: '0',
};

const subText = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '22px',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0 10px',
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

const hr = {
    borderColor: '#e2e8f0',
    margin: '32px 0 24px',
};

export default OnboardingEmail;
