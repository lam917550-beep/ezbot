require('dotenv').config();
const required=['BOT_TOKEN','WEBAPP_URL'];
for(const key of required){ if(!process.env[key]) throw new Error(`Thiếu biến môi trường: ${key}`); }
const adminIds=new Set(String(process.env.ADMIN_IDS||'').split(',').map(v=>v.trim()).filter(Boolean));
module.exports={
  BOT_TOKEN:process.env.BOT_TOKEN,
  WEBAPP_URL:process.env.WEBAPP_URL,
  WEBHOOK_URL:process.env.WEBHOOK_URL||`${process.env.WEBAPP_URL.replace(/\/$/,'')}/webhook`,
  JWT_SECRET:process.env.JWT_SECRET||'change-me-in-production',
  PORT:Number(process.env.PORT||10000), NODE_ENV:process.env.NODE_ENV||'development', adminIds
};
