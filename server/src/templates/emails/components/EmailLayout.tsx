import * as React from 'react';
import {
    Html,
    Body,
    Head,
    Heading,
    Container,
    Preview,
    Section,
    Text,
    Img,
    Link,
    Hr,
} from '@react-email/components';

interface EmailLayoutProps {
    previewText: string;
    heading?: string;
    schoolName?: string;
    logoUrl?: string; // Optional custom logo
    schoolId?: string;
    children: React.ReactNode;
}

const baseUrl = process.env.FRONTEND_URL || 'https://educorev1.up.railway.app';
const brandColor = '#1e3a8a';

export const EmailLayout = ({
    previewText,
    heading,
    schoolName = 'EDucore Platform',
    children,
}: EmailLayoutProps) => {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Img
                            src={`${baseUrl}/logo-educore.png`} // Ensure this asset exists publicly or use a CDN
                            width="50"
                            height="50"
                            alt="EDucore Logo"
                            style={logo}
                        />
                        <Text style={brandName}>{schoolName}</Text>
                    </Section>

                    {/* Main Content Card */}
                    <Section style={contentContainer}>
                        {heading && <Heading style={h1}>{heading}</Heading>}
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            &copy; {new Date().getFullYear()} EDucore V1. All rights reserved.
                        </Text>
                        <Text style={footerText}>
                            <Link href={`${baseUrl}/support`} style={link}>Help Center</Link> •{' '}
                            <Link href={`${baseUrl}/privacy`} style={link}>Privacy Policy</Link>
                        </Text>
                        <Text style={footerSubText}>
                            You represent an educational institution using the EDucore Platform.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f3f4f6',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    marginBottom: '64px',
    marginTop: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
    overflow: 'hidden',
};

const header = {
    padding: '32px 32px 20px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#ffffff',
};

const brandName = {
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '8px',
};

const logo = {
    margin: '0 auto',
};

const contentContainer = {
    padding: '40px 48px',
};

const h1 = {
    color: '#1e293b',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 24px',
    textAlign: 'left' as const,
};

const footer = {
    padding: '32px',
    backgroundColor: '#f8fafc',
    textAlign: 'center' as const,
    borderTop: '1px solid #f0f0f0',
};

const footerText = {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0',
};

const footerSubText = {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '12px 0 0',
};

const link = {
    color: brandColor,
    textDecoration: 'none',
    fontWeight: '500',
};
