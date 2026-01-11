import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import VerificationEmail from '../../common/mail/verification-email';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.initializeTransporter();
  }
  private initializeTransporter() {
    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };

    if (config.host && config.user && config.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.user, pass: config.pass },
        tls: { rejectUnauthorized: false },
      });
      this.logger.log(`✅ SMTP Configured: ${config.host}`);
    } else {
      this.logger.warn('❌ SMTP configuration missing. Emails will be logged to console only.');
    }
  }

  private async sendMail(options: nodemailer.SendMailOptions, token: string, type: string) {
    try {
      if (!this.transporter) {
        throw new Error('SMTP transporter is not configured');
      }

      await this.transporter.sendMail(options);
      this.logger.log(`📧 ${type} email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send ${type} email to ${options.to}: ${error.message}`);

      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(`[DEV MODE] ${type} token: ${token}`);
      }

      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string) {

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const emailHtml = await render(VerificationEmail({ verifyLink: verificationUrl }));

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@genwrite.com',
      to: email,
      subject: 'Verify your email address - Genwrite',
      html: emailHtml,
    };
    return this.sendMail(mailOptions, token, 'verification');
  }

}