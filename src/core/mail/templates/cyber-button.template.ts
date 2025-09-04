export const cyberButton = (text: string, url: string): string => {
    return `
    <div style="text-align: center; margin: 20px 0;">
      <a 
        href="${url}" 
        style="
          display: inline-block;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          color: #0f172a;
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(99,102,241,0.5);
        "
      >
        ${text}
      </a>
    </div>
  `;
};
