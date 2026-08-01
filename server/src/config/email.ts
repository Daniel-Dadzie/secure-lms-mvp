import nodemailer from "nodemailer";

// ----------------------------------------------------------------------------
// Gmail SMTP transport via nodemailer.
// Requires a Gmail App Password (not your regular Gmail password) —
// generate one at https://myaccount.google.com/apppasswords
// (requires 2-Step Verification enabled on the Google account).
// Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.
// ----------------------------------------------------------------------------
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection config on startup — fails fast if credentials are wrong
// rather than silently failing on the first real send attempt.
transporter.verify((error) => {
  if (error) {
    console.error("Gmail SMTP configuration error:", error);
  } else {
    console.log("Gmail SMTP ready to send emails");
  }
});