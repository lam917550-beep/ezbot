'use strict';
const db = require('../../database/db');
const eco = require('./economy');
const C = require('../../config/constants');
const { toBigInt } = require('../../utils/format');
const { nowSec } = require('../../utils/time');

function deposit(id, amount) {
  const a = toBigInt(amount);
  if (a <= 0n) throw new Error('Invalid deposit amount');
  const u = db.prepare('SELECT bank FROM users WHERE id=?').get(String(id));
  if (!u) throw new Error('User not found');
  eco.subtractBalance(id, a, 'bank_deposit', 'deposit');
  const next = toBigInt(u.bank) + a;
  db.prepare('UPDATE users SET bank=?,updated_at=? WHERE id=?').run(next.toString(), nowSec(), String(id));
  return next;
}

function withdraw(id, amount) {
  const a = toBigInt(amount);
  if (a <= 0n) throw new Error('Invalid withdraw amount');
  const u = db.prepare('SELECT bank FROM users WHERE id=?').get(String(id));
  if (!u) throw new Error('User not found');
  const bank = toBigInt(u.bank);
  if (bank < a) throw new Error('Insufficient bank balance');
  const fee = a * 5n / 1000n;
  const net = a - fee;
  db.prepare('UPDATE users SET bank=?,updated_at=? WHERE id=?').run((bank-a).toString(), nowSec(), String(id));
  eco.addBalance(id, net, 'bank_withdraw', JSON.stringify({ fee: fee.toString() }));
  return bank-a;
}
function calculateInterest(balance, days) {
  const b = toBigInt(balance); let factor = 1000000n;
  const daily = 10000n; // 1.00% in fixed point; compounding is applied per day.
  let value = b;
  for(let i=0;i<Math.max(0,Math.floor(days));i++) value = value + value*daily/factor;
  return value-b;
}
function applyInterest(id) {
  const row = db.prepare('SELECT bank FROM users WHERE id=?').get(String(id));
  if(!row) throw new Error('User not found');
  const b = toBigInt(row.bank); const interest = b/100n;
  if (interest > 0n) db.prepare('UPDATE users SET bank=?,updated_at=? WHERE id=?').run((b+interest).toString(), nowSec(), String(id));
  return interest;
}
module.exports = { deposit, withdraw, getBank:id=>toBigInt(db.prepare('SELECT bank FROM users WHERE id=?').get(String(id)).bank), applyInterest, calculateInterest, getBankHistory:()=>[] };
