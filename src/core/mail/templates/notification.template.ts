export const notificationTemplate = (message: string, link?: string) => `
  <div style="font-family: sans-serif; line-height: 1.5;">
    <h2>New Notification</h2>
    <p>${message}</p>
    ${link ? `<p><a href="${link}" target="_blank">View Details</a></p>` : ''}
    <hr />
    <p style="font-size: 12px; color: #888;">You are receiving this email because you have notifications in your account.</p>
  </div>
`;
