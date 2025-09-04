export const baseTemplate = (content: string): string => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #1e293b; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #6366f1, #0ea5e9); color: white; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">🚀 Cykruit</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #e0e7ff;">Your Cybersecurity Job Portal</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #e2e8f0; line-height: 1.6; font-size: 15px;">
        ${content}
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #334155; margin: 0 30px;"></div>

      <!-- Footer -->
      <div style="background: #0f172a; text-align: center; padding: 20px; font-size: 12px; color: #64748b;">
        © ${new Date().getFullYear()} Cykruit.com • All rights reserved
      </div>
    </div>
  </div>
  `;
};
