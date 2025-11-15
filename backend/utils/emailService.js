import nodemailer from "nodemailer";


// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.COMPANY_EMAIL,                 // CHANGED
      pass: process.env.COMPANY_EMAIL_APP_PASSWORD,    // CHANGED
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) { 
      return { success: false, message: "Email service not configured" };
    } 

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Shop4Ever" <${process.env.COMPANY_EMAIL}>`,   // CHANGED
      to: email,
      subject: "Password Reset OTP - Shop4Ever",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF8C00 0%, #8A2BE2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Shop4Ever</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">
              You have requested to reset your password. Use the following OTP to verify your identity:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #FF8C00; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request - Shop4Ever
        
        OTP: ${otp}
        
        Valid for 10 minutes.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_APP_PASSWORD) {
      return { success: false, message: "Email credentials not configured" };
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready to send messages");

    return { success: true };
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return { success: false, message: error.message };
  }
};
