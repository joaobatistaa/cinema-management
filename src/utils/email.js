import nodemailer from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_PUB,
} = process.env;

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: EMAIL_SECURE === "true",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: EMAIL_PUB,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}