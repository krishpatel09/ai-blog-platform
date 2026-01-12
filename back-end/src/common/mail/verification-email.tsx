import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
    verifyLink: string;
}

export const VerificationEmail = ({
    verifyLink = "https://genwrite.com/verify",
}: VerificationEmailProps) => (
    <Html>
        <Head />
        <Preview>Verify your email address for Genwrite</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={outerContainer}>
                    {/* Header */}
                    <Section style={header}>
                        <div style={logoWrapper}>
                            <div style={logoSquare}>Ai</div>
                            <span style={logoText}>Genwrite</span>
                        </div>
                    </Section>

                    {/* Content Section */}
                    <Section style={content}>
                        <Heading style={h2}>Verify your email address</Heading>
                        <Text style={paragraph}>
                            Thanks for creating an account on <strong>AiGenwrite</strong>. Please
                            confirm your email address to activate your account.
                        </Text>

                        <Section style={btnSection}>
                            <Link href={verifyLink} style={button}>
                                Verify Email
                            </Link>
                        </Section>

                        <Text style={subtext}>
                            Genwrite will never ask for your password or sensitive account information via email.
                            If you receive such a request, please report it to our security team.
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2026, AiGenwrite. All rights reserved{' '}
                            <Link href="https://genwrite.com/privacy">
                                privacy policy
                            </Link>
                            .
                        </Text>
                    </Section>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default VerificationEmail;

// --- CSS Styles ---
const main = { backgroundColor: "#ffffff" };
const container = { margin: "0 auto", padding: "20px 0" };
const outerContainer = { maxWidth: "600px", backgroundColor: "#f2f2f2", padding: "20px" };
const header = { backgroundColor: "#0f172a", padding: "20px", textAlign: "center" as const };
const logoWrapper = { display: "inline-flex", alignItems: "center", gap: "10px" };
const logoSquare = { width: "32px", height: "32px", backgroundColor: "#F59E0B", borderRadius: "4px", color: "#000", fontWeight: "bold", fontSize: "20px", textAlign: "center" as const, lineHeight: "32px" };
const logoText = { fontSize: "20px", fontWeight: "700", color: "#ffffff", marginLeft: "10px" };
const content = { padding: "35px", backgroundColor: "#ffffff" };
const h2 = { margin: "0 0 15px", color: "#111827", fontSize: "22px" };
const paragraph = { fontSize: "14px", lineHeight: "22px", color: "#374151" };
const btnSection = { margin: "30px 0", textAlign: "center" as const };
const button = { backgroundColor: "#F59E0B", color: "#000000", padding: "14px 28px", textDecoration: "none", fontSize: "16px", fontWeight: "600", borderRadius: "6px", display: "inline-block" };
const subtext = { fontSize: "13px", color: "#6b7280" };
const hr = { border: "none", borderTop: "1px solid #e5e7eb" };
const footer = { padding: "20px 35px 0" };
const footerText = { fontSize: "12px", color: "#6b7280", textAlign: "center" as const };