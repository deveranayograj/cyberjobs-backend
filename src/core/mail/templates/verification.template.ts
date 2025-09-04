import { baseTemplate } from './base.template';
import { cyberButton } from './cyber-button.template';

export const verificationTemplate = (verifyUrl: string): string => {
  const content = `
    <h2 style="color: #0ea5e9; margin-bottom: 10px;">Welcome to Cykruit 🎉</h2>
    <p style="color: #e2e8f0; line-height: 1.6;">
      Thanks for signing up! Please verify your email by clicking the button below:
    </p>
    ${cyberButton("Verify Email", verifyUrl)}
    <p style="color: #94a3b8; margin-top: 15px;">
      If you didn’t create this account, you can safely ignore this email.
    </p>
    <p style="color: #64748b; font-size: 12px; margin-top: 10px;">
      This link will expire in 1 hour.
    </p>
  `;

  return baseTemplate(content);
};
