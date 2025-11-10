const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(user, token) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"FinanceAI" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Verify Your Email - FinanceAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #2D3748;">Welcome to FinanceAI!</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #A67C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link: ${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"FinanceAI" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Password Reset - FinanceAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #2D3748;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #E53E3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link: ${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSecurityAlert(user, details) {
    const mailOptions = {
      from: `"FinanceAI Security" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Security Alert - FinanceAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #E53E3E;">Security Alert</h2>
          <p>Hi ${user.name},</p>
          <p>We detected suspicious activity on your account:</p>
          <ul>
            <li>Time: ${details.timestamp}</li>
            <li>IP Address: ${details.ipAddress}</li>
            <li>User Agent: ${details.userAgent}</li>
            <li>Activity: ${details.activity}</li>
          </ul>
          <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOTPEmail(user, otp) {
    const mailOptions = {
      from: `"FinanceAI" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Verify Your Email - FinanceAI',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2D3748; margin: 0;">FinanceAI</h1>
          </div>
          <h2 style="color: #2D3748;">Verify Your Email Address</h2>
          <p>Hi ${user.name},</p>
          <p>Welcome to FinanceAI! Please use the verification code below to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #f7fafc; border: 2px solid #A67C00; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2D3748;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #718096; font-size: 14px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();