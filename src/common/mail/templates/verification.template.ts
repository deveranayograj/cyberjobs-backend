import { baseTemplate } from './base.template';

export const verificationTemplate = (verifyUrl: string): string => {
    return baseTemplate(`
    <h2 style="color:#0f172a;">Welcome to Cykruit 🎉</h2>
    <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
    <p style="text-align:center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background:#2563eb; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
        Verify Email
      </a>
    </p>
    <p>If you didn’t create this account, you can safely ignore this email.</p>
    <p style="font-size:12px; color:#64748b;">This link will expire in 1 hour.</p>
  `);
};
