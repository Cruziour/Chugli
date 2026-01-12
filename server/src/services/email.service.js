import envConfig from '../config/env.config.js';
import axios from 'axios'

class EmailService {
  constructor() {
    this.apiKey = envConfig.emailApiKey;
    this.apiUrl = envConfig.emailApiUrl;
    this.from = envConfig.email.from;
  }  

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        apiKey: this.apiKey,
      };

      const response = await axios.post(`${this.apiUrl}/send-email`, mailOptions)
      
      console.log(`📧 Email sent to ${to}: ${response.data.messageId}`);

      return {
        success: true,
        messageId: response.data.messageId,
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTPEmail(email, otp, username) {
    const subject = '🔐 Chugli - Verify Your Email';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #3b82f6; font-size: 36px; margin: 0;">🗣️ Chugli</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Hyper-Local Messaging Hub</p>
          </div>
          
          <!-- Main Card -->
          <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #3b82f6;">
            
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
              Welcome, ${username}! 👋
            </h2>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0;">
              Use the OTP below to verify your email and start connecting with your neighbors.
            </p>
            
            <!-- OTP Box -->
            <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; border: 2px dashed #3b82f6;">
              <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">
                Your Verification Code
              </p>
              <div style="font-size: 40px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">
                ⏱️ Valid for 10 minutes
              </p>
            </div>
            
            <!-- Warning -->
            <div style="margin-top: 32px; padding: 16px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="color: #fca5a5; font-size: 13px; margin: 0;">
                ⚠️ Never share this OTP with anyone. Chugli team will never ask for your OTP.
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #4b5563; font-size: 12px; margin: 0;">
              If you didn't request this email, please ignore it.
            </p>
            <p style="color: #374151; font-size: 11px; margin: 16px 0 0 0;">
              © ${new Date().getFullYear()} Chugli. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email, username) {
    const subject = '🎉 Welcome to Chugli!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #3b82f6; font-size: 36px; margin: 0;">🗣️ Chugli</h1>
          </div>
          
          <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #3b82f6; text-align: center;">
            
            <div style="font-size: 64px; margin-bottom: 24px;">🎊</div>
            
            <h2 style="color: #10b981; font-size: 28px; margin: 0 0 16px 0;">
              You're All Set, ${username}!
            </h2>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
              Your email has been verified successfully. Start exploring local chat rooms and connect with people around you!
            </p>
            
            <div style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Chatting 🚀
            </div>
            
            <!-- Features -->
            <div style="margin-top: 40px; text-align: left;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">What you can do:</h3>
              
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="color: #3b82f6; margin-right: 12px;">📍</span>
                <span style="color: #9ca3af; font-size: 14px;">Discover rooms within 500m - 5km</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="color: #3b82f6; margin-right: 12px;">🔒</span>
                <span style="color: #9ca3af; font-size: 14px;">Create private password-protected rooms</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="color: #3b82f6; margin-right: 12px;">💬</span>
                <span style="color: #9ca3af; font-size: 14px;">Chat instantly - messages never stored</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #3b82f6; margin-right: 12px;">🛡️</span>
                <span style="color: #9ca3af; font-size: 14px;">100% privacy - zero data footprint</span>
              </div>
            </div>
            
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #374151; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} Chugli. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetEmail(email, otp, username) {
    const subject = '🔑 Chugli - Reset Your Password';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #3b82f6; font-size: 36px; margin: 0;">🗣️ Chugli</h1>
          </div>
          
          <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #f59e0b;">
            
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
              Password Reset Request 🔐
            </h2>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0;">
              Hi ${username}, we received a request to reset your password. Use the OTP below:
            </p>
            
            <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; border: 2px dashed #f59e0b;">
              <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">
                Password Reset Code
              </p>
              <div style="font-size: 40px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">
                ⏱️ Valid for 10 minutes
              </p>
            </div>
            
            <div style="margin-top: 32px; padding: 16px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="color: #fca5a5; font-size: 13px; margin: 0;">
                ⚠️ If you didn't request this, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #374151; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} Chugli. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

const emailService = new EmailService();
export default emailService;
