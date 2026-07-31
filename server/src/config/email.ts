import nodemailer from "nodemailer";

// ----------------------------------------------------------------------------
// Nodemailer transporter using Gmail SMTP.
// Uses app password — never your real Gmail password.
// App passwords are generated at myaccount.google.com/apppasswords
// ----------------------------------------------------------------------------
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS on port 587 — not SSL on 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup in development
if (process.env.NODE_ENV !== "production") {
  transporter.verify((error) => {
    if (error) {
      console.error("Email transporter error:", error);
    } else {
      console.log("Email transporter ready");
    }
  });
}