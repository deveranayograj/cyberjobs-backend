export const baseTemplate = (content: string): string => {
    return `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <div style="background: #0f172a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚀 Cykruit.com</h1>
      </div>

      <div style="padding: 30px; color: #333;">
        ${content}
      </div>

      <div style="background: #f1f5f9; text-align: center; padding: 15px; font-size: 12px; color: #64748b;">
        © ${new Date().getFullYear()} Cykruit.com • All rights reserved
      </div>
    </div>
  </div>
  `;
};
