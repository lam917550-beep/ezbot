const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const csv = (value) => String(value || '').split(',').map(v => v.trim()).filter(Boolean);
const config = {
  port: Number(process.env.PORT || 10000),
  botToken: process.env.BOT_TOKEN || '',
  adminIds: csv(process.env.ADMIN_IDS),
  webappUrl: process.env.WEBAPP_URL || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || process.env.WEBAPP_URL || '*',
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'data', 'casino.db'),
  isProduction: (process.env.NODE_ENV || 'development') === 'production'
};
module.exports = config;
