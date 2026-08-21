import { transporter } from "../config/email";

const FROM = process.env.SMTP_FROM || `Mech Spec LMS <${process.env.SMTP_USER}>`;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ----------------------------------------------------------------------------
// Email templates — inline HTML for simplicity.
// For production, swap with a template engine (MJML, React Email, etc.)
// ----------------------------------------------------------------------------

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  token: string
): Promise<void> {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your Mech Spec Technologies account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to Mech Spec Technologies, ${fullName}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            background: #6B3FA0;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 16px 0;
          "
        >
          Verify Email Address
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours. If you did not create an account,
          you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #6B3FA0;">${verifyUrl}</a>
        </p>
      </div>
    `,
  });
}

export async function sendForgotPasswordEmail(
  email: string,
  fullName: string,
  token: string,
  expiresAt: Date
): Promise<void> {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  // Human-readable expiry, shown for clarity only — the actual enforcement
  // happens server-side in resetPassword() against the DB-stored expiresAt,
  // never trusting anything from the URL or client.
  const expiryText = expiresAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Mech Spec Technologies password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Password Reset Request</h2>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            background: #6B3FA0;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 16px 0;
          "
        >
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires at <strong>${expiryText}</strong>. If you did not request a password reset,
          you can safely ignore this email — your password will not be changed.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #6B3FA0;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}


export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  tempPassword: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your Mech Spec Technologies password has been reset",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Password Reset — Mech Spec Technologies</h2>
        <p>Hi ${fullName},</p>
        <p>An administrator has reset your password. Your temporary password is:</p>
        <div style="
          background: #f5f5f5;
          padding: 16px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 18px;
          letter-spacing: 2px;
          text-align: center;
          margin: 16px 0;
        ">
          ${tempPassword}
        </div>
        <p>Please log in and change your password immediately.</p>
        <a
          href="${CLIENT_URL}/login"
          style="
            display: inline-block;
            background: #6B3FA0;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
          "
        >
          Login Now
        </a>
        <p style="color: #666; font-size: 14px;">
          If you did not request this reset, contact support immediately.
        </p>
      </div>
    `,
  });
}

export async function sendEnrollmentConfirmationEmail(
  email: string,
  fullName: string,
  courseTitle: string,
  courseId: string
): Promise<void> {
  const courseUrl = `${CLIENT_URL}/courses/${courseId}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `You're enrolled in ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Enrollment Confirmed!</h2>
        <p>Hi ${fullName},</p>
        <p>You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
        <a
          href="${courseUrl}"
          style="
            display: inline-block;
            background: #6B3FA0;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 16px 0;
          "
        >
          Start Learning
        </a>
        <p style="color: #666; font-size: 14px;">
          Good luck with your learning journey!
        </p>
      </div>
    `,
  });
}

export async function sendCertificateEmail(
  email: string,
  fullName: string,
  courseTitle: string,
  certificateNumber: string
): Promise<void> {
  const certificateUrl = `${CLIENT_URL}/certificates/${certificateNumber}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Congratulations! You completed ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">🎉 Course Completed!</h2>
        <p>Hi ${fullName},</p>
        <p>
          Congratulations on completing <strong>${courseTitle}</strong>!
          Your certificate has been generated.
        </p>
        <p style="font-size: 14px; color: #666;">
          Certificate Number: <strong>${certificateNumber}</strong>
        </p>
        <a
          href="${certificateUrl}"
          style="
            display: inline-block;
            background: #6B3FA0;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 16px 0;
          "
        >
          View Certificate
        </a>
      </div>
    `,
  });
}
