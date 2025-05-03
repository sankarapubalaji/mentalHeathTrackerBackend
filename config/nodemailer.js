import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize a single transporter instance for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('Gmail transporter verification failed:', error);
  } else {
    console.log('Gmail transporter is ready');
  }
});

// Send Verification Email
const sendVerificationEmail = async (to, name, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;
    const mailOptions = {
      from: `"Mental Health Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify Your Email - Mental Health Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Welcome, ${name || 'User'}!</h2>
          <p style="color: #555;">Thank you for joining Mental Health Support. Please verify your email to activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="color: #555;">If the button doesn't work, copy and paste this link: <a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a></p>
          <p style="color: #555;">If you didn’t sign up, please ignore this email.</p>
          <p style="color: #555;">Best regards,<br>Mental Health Support Team</p>
        </div>
      `,
      text: `Welcome, ${name || 'User'}!\n\nPlease verify your email: ${verificationUrl}\n\nIf you didn’t sign up, please ignore this email.\n\nBest regards,\nMental Health Support Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending verification email to ${to}:`, error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send Consultation Email
const sendConsultationEmail = async (to, patientName, doctorName, contact, email, concern, timing) => {
  try {
    const mailOptions = {
      from: `"Mental Health Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Consultation Request from Dr. ${doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Consultation Request</h2>
          <p style="color: #555;">Dear ${patientName},</p>
          <p style="color: #555;">Dr. ${doctorName} would like to schedule a consultation with you. Please review the details below and respond at your earliest convenience:</p>
          <ul style="color: #555; list-style-type: none; padding: 0;">
            <li><strong>Doctor's Name:</strong> Dr. ${doctorName}</li>
            <li><strong>Contact:</strong> ${contact}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Concern:</strong> ${concern}</li>
            <li><strong>Proposed Timing:</strong> ${timing}</li>
          </ul>
          <p style="color: #555;">Best regards,<br>Mental Health Support Team</p>
        </div>
      `,
      text: `
        Dear ${patientName},\n\n
        Dr. ${doctorName} would like to schedule a consultation with you. Please review the details below and respond at your earliest convenience:\n\n
        Doctor's Name: Dr. ${doctorName}\n\n
        Contact: ${contact}\n\n
        Email: ${email}\n\n
        Concern: ${concern}\n\n
        Proposed Timing: ${timing}\n\n
        Best regards,\n\n
        Mental Health Support Team
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Consultation email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending consultation email to ${to}:`, error);
    throw new Error(`Failed to send consultation email: ${error.message}`);
  }
};

export { sendVerificationEmail, sendConsultationEmail };