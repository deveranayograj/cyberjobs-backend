import { baseTemplate } from "./base.template";
import { cyberButton } from "./cyber-button.template";

export const notificationTemplate = (message: string, link?: string) => {
  const content = `
    <div style="color: #e2e8f0; line-height: 1.6; font-size: 15px;">
      <h2 style="color: #0ea5e9; margin-bottom: 10px;">🔔 New Notification</h2>
      <p>${message}</p>
      ${link ? cyberButton("View Details", link) : ""}
      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
        You are receiving this email because you have notifications in your Cykruit account.
      </p>
    </div>
  `;
  return baseTemplate(content);
};
