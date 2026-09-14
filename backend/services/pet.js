'use strict';
const db = require('../../database/db');
const C = require('../../config/constants');
const eco = require('./economy');
const { nowSec } = require('../../utils/time');
const { toBigInt } = require('../../utils/format');

function percentageToScaled(value) {
  const text = String(value ?? '0').trim().replace(',', '.');
  const match = text.match(/^([0-9]+)(?:\.([0-9]{1,6}))?$/);
  if (!match) return 0n;
  return BigInt(match[1]) * 1000000n + BigInt((match[2] || '').padEnd(6, '0') || '0');
}
function applyPercent(base, percent) {
  const amount = toBigInt(base);
  const scaled = percentageToScaled(percent);
  return amount + (amount * scaled) / (100000000n);
}
function getAllPets(includeHidden = false) { return db.prepare(`SELECT * FROM pets ${includeHidden ? '' : 'WHERE hidden=0'} ORDER BY order_index ASC`).all(); }
function getPetById(id) { return db.prepare('SELECT * FROM pets WHERE id=?').get(String(id)); }
function getUserPets(id) { return db.prepare('SELECT p.*,up.level AS user_level,up.equipped FROM user_pets up JOIN pets p ON p.id=up.pet_id WHERE up.user_id=? ORDER BY p.order_index').all(String(id)); }
function buyPet(id, petId) {
  const p = getPetById(petId); if (!p) throw new Error('Pet not found');
  if (p.hidden) throw new Error('Pet is unavailable');
  if (db.prepare('SELECT 1 FROM user_pets WHERE user_id=? AND pet_id=?').get(String(id), String(petId))) throw new Error('Pet already owned');
  eco.subtractBalance(id, p.price, 'pet_purchase', petId);
  db.prepare('INSERT INTO user_pets(user_id,pet_id,level,equipped,acquired_at) VALUES(?,?,?,?,?)').run(String(id), String(petId), 1, 0, nowSec());
  return true;
}
function addPetToUser(id, petId) {
  if (db.prepare('SELECT 1 FROM user_pets WHERE user_id=? AND pet_id=?').get(String(id), String(petId))) return false;
  if (!getPetById(petId)) throw new Error('Pet not found');
  db.prepare('INSERT INTO user_pets(user_id,pet_id,acquired_at) VALUES(?,?,?)').run(String(id), String(petId), nowSec());
  return true;
}
function sellPet(id, petId) {
  const p = db.prepare('SELECT p.* FROM user_pets up JOIN pets p ON p.id=up.pet_id WHERE up.user_id=? AND up.pet_id=?').get(String(id), String(petId));
  if (!p) throw new Error('Pet not owned');
  const refund = toBigInt(p.price) * BigInt(Math.round(Number(C.SELL_PET_RATIO * 100))) / 100n;
  db.prepare('DELETE FROM user_pets WHERE user_id=? AND pet_id=?').run(String(id), String(petId));
  db.prepare('UPDATE users SET pet_equipped=NULL,updated_at=? WHERE id=? AND pet_equipped=?').run(nowSec(), String(id), String(petId));
  eco.addBalance(id, refund, 'pet_sale', petId);
  return refund;
}
function equipPet(id, petId) {
  if (!db.prepare('SELECT 1 FROM user_pets WHERE user_id=? AND pet_id=?').get(String(id), String(petId))) throw new Error('Pet not owned');
  db.transaction(() => {
    db.prepare('UPDATE user_pets SET equipped=0 WHERE user_id=?').run(String(id));
    db.prepare('UPDATE user_pets SET equipped=1 WHERE user_id=? AND pet_id=?').run(String(id), String(petId));
    db.prepare('UPDATE users SET pet_equipped=?,updated_at=? WHERE id=?').run(String(petId), nowSec(), String(id));
  })();
  return true;
}
function unequipPet(id) { db.transaction(() => { db.prepare('UPDATE user_pets SET equipped=0 WHERE user_id=?').run(String(id)); db.prepare('UPDATE users SET pet_equipped=NULL,updated_at=? WHERE id=?').run(nowSec(), String(id)); })(); return true; }
function getEquippedPet(id) { return db.prepare('SELECT p.*,up.level AS user_level FROM user_pets up JOIN pets p ON p.id=up.pet_id WHERE up.user_id=? AND up.equipped=1').get(String(id)) || null; }
function upgradePet(id, petId) {
  const row = db.prepare('SELECT p.price,p.max_level,p.upgrade_cost_per_level,up.level FROM user_pets up JOIN pets p ON p.id=up.pet_id WHERE up.user_id=? AND up.pet_id=?').get(String(id), String(petId));
  if (!row) throw new Error('Pet not owned');
  const maxLevel = Number(row.max_level || C.PET_UPGRADE_MAX);
  if (row.level >= maxLevel) throw new Error('Pet max level');
  const cost = row.upgrade_cost_per_level && BigInt(row.upgrade_cost_per_level) > 0n ? BigInt(row.upgrade_cost_per_level) * BigInt(row.level) : toBigInt(row.price) * 20n * BigInt(row.level) / 100n;
  eco.subtractBalance(id, cost, 'pet_upgrade', petId);
  db.prepare('UPDATE user_pets SET level=level+1 WHERE user_id=? AND pet_id=?').run(String(id), String(petId));
  return true;
}
function applyPetBonus(id, base, type) {
  const p = getEquippedPet(id);
  if (!p) return toBigInt(base);
  const bonus = type === 'xp' ? p.xp_bonus : p.money_bonus;
  return applyPercent(base, bonus);
}
function createPet(d) {
  const price = d.price == null ? 0 : String(d.price);
  db.prepare('INSERT INTO pets(id,name,icon,description,rarity,money_bonus,xp_bonus,price,hidden,order_index,max_level,upgrade_cost_per_level,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(String(d.id), String(d.name), String(d.icon), String(d.description || ''), String(d.rarity || 'Common'), String(d.moneyBonus || 0), String(d.xpBonus || 0), price, d.hidden ? 1 : 0, Number(d.orderIndex || 999), Number(d.maxLevel || 10), String(d.upgradeCost || 0), nowSec(), nowSec());
  return getPetById(d.id);
}
function updatePet(id, field, value) {
  const allowed = ['name','icon','money_bonus','xp_bonus','price','hidden','rarity','description']; if (!allowed.includes(field)) throw new Error('Invalid field');
  db.prepare(`UPDATE pets SET ${field}=?,updated_at=? WHERE id=?`).run(String(value), nowSec(), String(id)); return true;
}
function deletePet(id) { db.transaction(() => { db.prepare('DELETE FROM user_pets WHERE pet_id=?').run(String(id)); db.prepare('UPDATE users SET pet_equipped=NULL,updated_at=? WHERE pet_equipped=?').run(nowSec(), String(id)); db.prepare('DELETE FROM pets WHERE id=?').run(String(id)); })(); return true; }
module.exports = { getAllPets, getPetById, getUserPets, buyPet, sellPet, equipPet, unequipPet, getEquippedPet, upgradePet, applyPetBonus, createPet, updatePet, deletePet, addPetToUser };
