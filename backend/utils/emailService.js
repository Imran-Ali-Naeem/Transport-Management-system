const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('Using development email configuration');
    // Create a test account for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'testpassword'
      }
    });
  }

  // Production configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CFD Transport System" <${process.env.EMAIL_USER || 'test@ethereal.email'}>`,
      to: email,
      subject: 'Verify Your Email - CFD Transport System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5e35b1; margin: 0;">CFD Transport System</h1>
              <p style="color: #666; margin-top: 5px;">Email Verification</p>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Hello ${name || 'there'},</h2>
              <p style="color: #34495e; margin-bottom: 25px;">
                Thank you for registering with the CFD Transport System. To complete your registration, please use the following verification code:
              </p>
              
              <div style="background-color: #fff; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 25px;">
                <h1 style="color: #5e35b1; font-size: 36px; letter-spacing: 5px; margin: 0;">
                  ${otp}
                </h1>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⚠️ This code will expire in <strong>30 minutes</strong>.<br>
                  🔒 For your security, never share this code with anyone.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                If you didn't request this verification code, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message, please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} CFD Transport System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      to: email,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
    
    // If using ethereal email in development, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };