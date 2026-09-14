'use strict';

const db = require('../../database/db');
const eco = require('./economy');
const { nowSec } = require('../../utils/time');

function bind(referrer, referred) {
  const referrerId = String(referrer);
  const referredId = String(referred);
  if (referrerId === referredId) throw new Error('Self referral');
  if (db.prepare('SELECT 1 FROM referrals WHERE referred_id=?').get(referredId)) return false;
  db.prepare('INSERT INTO referrals(referrer_id,referred_id,level,rewarded,created_at) VALUES(?,?,?,?,?)').run(referrerId, referredId, 1, 0, nowSec());
  eco.addBalance(referrerId, 10000n, 'referral');
  return true;
}

function getByUser(id) {
  const userId = String(id);
  return db.prepare('SELECT * FROM referrals WHERE referrer_id=? OR referred_id=?').all(userId, userId);
}

module.exports = { bind, getByUser };
