import { Resend } from "resend";
import AdminEmail from "../emails/AdminEmail";
import ChangeEmail from "../emails/ChangeEmail";
import VerifyEmail from "../emails/VerifyEmail";
import { createEmailActionToken } from "../lib/emailTokens";
import { logger } from "../middleware/logging";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "oldziej.pl <noreply@oldziej.pl>";

export const sendVerificationEmail = async (user) => {
  if (!user?.email) return { error: "Account has no email address." };

  const token = createEmailActionToken({
    purpose: "verify-email",
    userId: user._id.toString(),
    userEmail: user.email
  });

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "Email Verification",
    react: VerifyEmail({ userEmail: user.email, token })
  });
};

export const sendChangeEmailRequest = async (user, newUserEmail) => {
  const token = createEmailActionToken({
    purpose: "change-email",
    userId: user._id.toString(),
    userEmail: user.email,
    newUserEmail
  });

  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "Change Your Email",
    react: ChangeEmail({ userEmail: user.email, newUserEmail, token })
  });
};

export const notifyAdmin = async (subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject,
    react: AdminEmail({ message })
  });
};

export const notifyAdminSafely = (subject, message) => {
  notifyAdmin(subject, message).catch((error) => {
    logger.error("Admin notification failed", { subject, error: error.message });
  });
};

export const sendVerificationEmailSafely = (user) => {
  sendVerificationEmail(user).catch((error) => {
    logger.error("Verification email failed", { userId: user?._id?.toString(), error: error.message });
  });
};
