import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_SERVER,
  port: parseInt(process.env.MAIL_SMTP_PORT || '587'),
  secure: process.env.MAIL_SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_SMTP_USERNAME,
    pass: process.env.MAIL_SMTP_TOKEN
  }
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.MAIL_SMTP_USERNAME,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, name: string, verificationToken: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const year = new Date().getFullYear();
  
  // Read the email template
  // __dirname in compiled code will be dist/src/utils/, so go up to backend root then into src/templates
  // Also try process.cwd() as fallback for different execution contexts
  let templatePath = path.resolve(__dirname, '../../src/templates/email-verification.html');
  if (!fs.existsSync(templatePath)) {
    // Fallback: try from process.cwd() (if running from backend directory)
    templatePath = path.join(process.cwd(), 'src/templates/email-verification.html');
  }
  let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace template variables
  htmlTemplate = htmlTemplate.replace(/\{\{name\}\}/g, name || 'User');
  htmlTemplate = htmlTemplate.replace(/\{\{verificationUrl\}\}/g, verificationUrl);
  htmlTemplate = htmlTemplate.replace(/\{\{year\}\}/g, year.toString());
  
  const mailOptions = {
    from: process.env.MAIL_SMTP_USERNAME,
    to: email,
    subject: 'Verify Your Email',
    html: htmlTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
