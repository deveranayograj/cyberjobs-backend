export const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
};
