'use strict';
const db = require('../../database/db');
const games = require('../../data/games');
const resolvers = require('../../data/gameResolvers');
const rng = require('./rng');
const energy = require('./energy');
const level = require('./level');
const pet = require('./pet');
const jackpot = require('./jackpot');
const quest = require('./quest');
const achievement = require('./achievement');
const leaderboard = require('./leaderboard');
const C = require('../../config/constants');
const { toBigInt } = require('../../utils/format');
const { nowSec } = require('../../utils/time');

function multiply(amount, multiplier) {
  const text = String(multiplier ?? 0);
  const m = text.match(/^([0-9]+)(?:\.([0-9]{1,6}))?$/);
  if (!m) return 0n;
  const scaled = BigInt(m[1]) * 1000000n + BigInt((m[2] || '').padEnd(6, '0') || '0');
  return toBigInt(amount) * scaled / 1000000n;
}
function cleanResult(result) {
  const out = { ...result };
  delete out.mines;
  delete out.chests;
  delete out.safe;
  delete out.crashPoint;
  return JSON.parse(JSON.stringify(out));
}
function getGame(code) { return games.find(g => g.code === code) || null; }

function play(userId, gameCode, amount, input = {}) {
  const userIdText = String(userId);
  const game = getGame(String(gameCode));
  if (!game) throw new Error('Unknown game');
  const betAmount = toBigInt(amount);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(userIdText);
  if (!user) throw new Error('User not found');
  if (user.banned) throw new Error('Banned');
  if (Number(user.muted || 0) && Number(user.muted_until || 0) > nowSec()) throw new Error('Muted');
  if (betAmount < C.MIN_BET) throw new Error(`Minimum bet is ${C.MIN_BET.toString()}`);
  const balance = toBigInt(user.balance);
  if (betAmount * 100n > balance * C.MAX_BET_RATIO) throw new Error('Bet exceeds 75% of balance');

  // Resolve the actual game outcome before mutating the wallet. The server is authoritative.
  const gate = rng.rollWin(userIdText);
  const resolver = resolvers[game.code];
  if (typeof resolver !== 'function') throw new Error('Game resolver unavailable');
  const result = resolver(input || {}, rng, gate);
  const multiplier = Number(result.multiplier || 0);
  if (!Number.isFinite(multiplier) || multiplier < 0) throw new Error('Invalid payout result');
  const won = Boolean(result.win) || multiplier > 0;
  const basePayout = won && multiplier > 0 ? multiply(betAmount, multiplier) : 0n;
  const finalPayout = won && basePayout > 0n ? pet.applyPetBonus(userIdText, basePayout, 'money') : 0n;
  const energyCost = rng.randomInt(C.ENERGY_MIN_COST, C.ENERGY_MAX_COST);
  const before = toBigInt(balance);

  const transaction = db.transaction(() => {
    const fresh = db.prepare('SELECT balance,energy,total_wagered FROM users WHERE id=?').get(userIdText);
    const freshBalance = toBigInt(fresh.balance);
    if (betAmount * 100n > freshBalance * C.MAX_BET_RATIO) throw new Error('Balance changed; bet rejected');
    if (Number(fresh.energy) < energyCost) throw new Error('Not enough energy');
    const afterBet = freshBalance - betAmount + finalPayout;
    const finalEnergy = Number(fresh.energy) - energyCost;
    const newWagered = toBigInt(fresh.total_wagered) + betAmount;
    db.prepare('UPDATE users SET balance=?,energy=?,total_bets=total_bets+1,total_wagered=?,updated_at=? WHERE id=?')
      .run(afterBet.toString(), finalEnergy, newWagered.toString(), nowSec(), userIdText);
    db.prepare('INSERT INTO transactions(user_id,type,amount,balance_before,balance_after,note,meta,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .run(userIdText, 'bet', (-betAmount).toString(), freshBalance.toString(), (freshBalance - betAmount).toString(), game.code, JSON.stringify({ energyCost }), nowSec());
    if (finalPayout > 0n) {
      db.prepare('INSERT INTO transactions(user_id,type,amount,balance_before,balance_after,note,meta,created_at) VALUES(?,?,?,?,?,?,?,?)')
        .run(userIdText, 'payout', finalPayout.toString(), (freshBalance - betAmount).toString(), afterBet.toString(), game.code, JSON.stringify({ multiplier }), nowSec());
    }
    db.prepare('INSERT INTO bets(user_id,game,amount,result,payout,multiplier,metadata,balance_after,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(userIdText, game.code, betAmount.toString(), finalPayout > 0n ? 'win' : 'loss', finalPayout.toString(), multiplier, JSON.stringify(cleanResult(result)), afterBet.toString(), nowSec());
    const gs = db.prepare('SELECT * FROM game_stats WHERE game=?').get(game.code);
    if (!gs) {
      db.prepare('INSERT INTO game_stats(game,total_plays,total_wins,total_wagered,total_payout,updated_at) VALUES(?,?,?,?,?,?)').run(game.code, 1, finalPayout > 0n ? 1 : 0, betAmount.toString(), finalPayout.toString(), nowSec());
    } else {
      db.prepare('UPDATE game_stats SET total_plays=?,total_wins=?,total_wagered=?,total_payout=?,updated_at=? WHERE game=?')
        .run(Number(gs.total_plays) + 1, Number(gs.total_wins) + (finalPayout > 0n ? 1 : 0), (toBigInt(gs.total_wagered) + betAmount).toString(), (toBigInt(gs.total_payout) + finalPayout).toString(), nowSec(), game.code);
    }
    const ugs = db.prepare('SELECT * FROM user_game_stats WHERE user_id=? AND game=?').get(userIdText, game.code);
    if (!ugs) {
      db.prepare('INSERT INTO user_game_stats(user_id,game,plays,wins,wagered,won) VALUES(?,?,?,?,?,?)').run(userIdText, game.code, 1, finalPayout > 0n ? 1 : 0, betAmount.toString(), finalPayout.toString());
    } else {
      db.prepare('UPDATE user_game_stats SET plays=?,wins=?,wagered=?,won=? WHERE user_id=? AND game=?')
        .run(Number(ugs.plays) + 1, Number(ugs.wins) + (finalPayout > 0n ? 1 : 0), (toBigInt(ugs.wagered) + betAmount).toString(), (toBigInt(ugs.won) + finalPayout).toString(), userIdText, game.code);
    }
    if (finalPayout > 0n) {
      const statsUser = db.prepare('SELECT total_won,biggest_win FROM users WHERE id=?').get(userIdText);
      const biggest = toBigInt(statsUser.biggest_win);
      db.prepare('UPDATE users SET total_wins=total_wins+1,total_won=?,win_streak=win_streak+1,max_win_streak=MAX(max_win_streak,win_streak+1),biggest_win=? WHERE id=?')
        .run((toBigInt(statsUser.total_won) + finalPayout).toString(), (finalPayout > biggest ? finalPayout : biggest).toString(), userIdText);
    } else {
      db.prepare('UPDATE users SET total_losses=total_losses+1,win_streak=0 WHERE id=?').run(userIdText);
    }
  });
  transaction();

  if (finalPayout > 0n) {
    const baseXp = BigInt(rng.randomInt(C.XP_MIN_WIN, C.XP_MAX_WIN));
    const finalXp = pet.applyPetBonus(userIdText, baseXp, 'xp');
    level.addXP(userIdText, Number(finalXp));
  }
  quest.progressQuest(userIdText, 'daily', 1);
  if (finalPayout > 0n) quest.progressQuest(userIdText, 'win', 1);
  if (betAmount > 0n) jackpot.contributeToJackpot(betAmount / 100n);
  if (finalPayout > 0n) jackpot.tryTriggerJackpot(userIdText, game.code);
  achievement.progressForGame?.(userIdText, { won: finalPayout > 0n, wagered: betAmount });
  leaderboard.invalidate();

  const latest = db.prepare('SELECT balance,energy FROM users WHERE id=?').get(userIdText);
  return {
    betId: db.prepare('SELECT id FROM bets WHERE user_id=? AND game=? ORDER BY id DESC LIMIT 1').get(userIdText, game.code).id,
    game: game.code,
    result: { ...cleanResult(result), win: finalPayout > 0n, multiplier: finalPayout > 0n ? multiplier : 0, payout: finalPayout.toString() },
    balance: String(latest.balance),
    energy: { current: Number(latest.energy), max: Number(user.max_energy || C.START_ENERGY) },
    level: level.getLevel(userIdText)
  };
}

module.exports = { play, getGame };
