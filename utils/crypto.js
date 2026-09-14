'use strict';
const crypto = require('crypto');

function telegramSecretKey(botToken) {
  return crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
}

function verifyTelegramInitData(initData, botToken, maxAge = 86400) {
  try {
    if (!initData || !botToken) return { ok: false, error: 'Missing initData or bot token' };
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return { ok: false, error: 'Missing or invalid hash' };
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    const calculated = crypto.createHmac('sha256', telegramSecretKey(botToken)).update(dataCheckString).digest('hex');
    const valid = crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
    if (!valid) return { ok: false, error: 'Invalid Telegram initData signature' };
    const authDate = Number(params.get('auth_date') || 0);
    const age = Math.floor(Date.now() / 1000) - authDate;
    if (!authDate || age < -60 || age > maxAge) return { ok: false, error: 'Expired Telegram initData' };
    let user = null;
    try { user = JSON.parse(params.get('user') || 'null'); } catch { return { ok: false, error: 'Invalid Telegram user JSON' }; }
    if (!user || !/^\d+$/.test(String(user.id))) return { ok: false, error: 'Invalid Telegram user' };
    return { ok: true, user, authDate };
  } catch (error) {
    return { ok: false, error: 'Authentication verification failed' };
  }
}

module.exports = { verifyTelegramInitData };
