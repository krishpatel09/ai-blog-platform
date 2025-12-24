import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Only create transporter if SMTP is configured
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      const port = parseInt(process.env.SMTP_PORT || '587');
      // Port 465 requires secure: true, port 587 uses STARTTLS (secure: false)
      const secure = port === 465 || process.env.SMTP_SECURE === 'true';

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Connection timeout settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        // TLS options for port 587 (STARTTLS)
        requireTLS: port === 587,
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates in development
        },
      });

      this.logger.log(
        `SMTP transporter configured for ${process.env.SMTP_HOST}:${port} (secure: ${secure})`,
      );
    } else {
      this.logger.warn(
        'SMTP configuration is missing. Email functionality will be disabled. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.',
      );
    }
  }

  async sendVerificationEmail(email: string, username: string, token: string) {
    if (!this.transporter) {
      this.logger.error(
        'Cannot send verification email: SMTP is not configured. Please set SMTP environment variables.',
      );
      // In development, you might want to log the token instead of throwing
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(
          `[DEV MODE] Verification token for ${email}: ${token}`,
        );
        return;
      }
      throw new Error('Email service is not configured');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${username}!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; 
                      color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>  
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send verification email to ${email}: ${errorMessage}`,
      );

      // In development, log the token instead of failing completely
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(
          `[DEV MODE] Email sending failed, but here's the verification token for ${email}: ${token}`,
        );
        this.logger.warn(
          `[DEV MODE] Verification URL: ${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        );
        // Don't throw in dev mode - allow signup to succeed
        return;
      }

      // In production, throw the error
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    if (!this.transporter) {
      this.logger.error(
        'Cannot send password reset email: SMTP is not configured. Please set SMTP environment variables.',
      );
      // In development, you might want to log the token instead of throwing
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(
          `[DEV MODE] Password reset token for ${email}: ${token}`,
        );
        return;
      }
      throw new Error('Email service is not configured');
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${username},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #EF4444; 
                      color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email and consider changing your password.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send password reset email to ${email}: ${errorMessage}`,
      );

      // In development, log the token instead of failing completely
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(
          `[DEV MODE] Email sending failed, but here's the password reset token for ${email}: ${token}`,
        );
        this.logger.warn(
          `[DEV MODE] Reset URL: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        );
        // Don't throw in dev mode
        return;
      }

      // In production, throw the error
      throw error;
    }
  }
}
