'use strict';
const crypto = require('crypto');
const db = require('../../database/db');
const C = require('../../config/constants');

function randomFloat() {
  return crypto.randomInt(0, 1000000000) / 1000000000;
}
function randomInt(min, max) {
  return crypto.randomInt(min, max + 1);
}
function pick(array) {
  if (!Array.isArray(array) || !array.length) throw new Error('Empty random pool');
  return array[randomInt(0, array.length - 1)];
}
function shuffle(array) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function weighted(items) {
  const total = items.reduce((sum, x) => sum + x.weight, 0);
  let cursor = randomFloat() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }
  return items[items.length - 1].value;
}
function rollWin(userId) {
  const row = db.prepare('SELECT win_rate_override FROM users WHERE id=?').get(String(userId));
  const rate = row && row.win_rate_override !== null ? Number(row.win_rate_override) : C.WIN_RATE_DEFAULT;
  return randomFloat() < Math.max(0, Math.min(1, rate));
}
function outcomeIndex(win, total, preferred = 0) {
  if (!win) return 0;
  return Math.max(0, Math.min(total - 1, preferred));
}
module.exports = { randomFloat, randomInt, pick, shuffle, weighted, rollWin, outcomeIndex };
