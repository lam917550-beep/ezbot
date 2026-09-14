'use strict';

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(Math.max(min, Math.min(max, n)));
}
function clampNum(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function cards52(rng) { return rng.shuffle(Array.from({ length: 52 }, (_, i) => ({ rank: (i % 13) + 1, suit: Math.floor(i / 13) }))); }
function score21(cards) {
  let total = 0, aces = 0;
  for (const c of cards) { const r = c.rank; if (r === 1) { total += 11; aces++; } else total += Math.min(10, r); }
  while (total > 21 && aces) { total -= 10; aces--; }
  return total;
}
function pokerHand(cards) {
  const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
  const counts = new Map();
  for (const r of ranks) counts.set(r, (counts.get(r) || 0) + 1);
  const groups = [...counts.values()].sort((a, b) => b - a);
  const flush = cards.every(c => c.suit === cards[0].suit);
  const unique = [...new Set(ranks)];
  let straight = false;
  if (unique.length === 5) straight = unique[4] - unique[0] === 4 || unique.join(',') === '1,10,11,12,13';
  if (straight && flush) return ['straight_flush', 50];
  if (groups[0] === 4) return ['four_kind', 20];
  if (groups[0] === 3 && groups[1] === 2) return ['full_house', 8];
  if (flush) return ['flush', 6];
  if (straight) return ['straight', 5];
  if (groups[0] === 3) return ['three_kind', 4];
  if (groups[0] === 2 && groups[1] === 2) return ['two_pair', 3];
  if (groups[0] === 2) return ['pair', 2];
  return ['high_card', 0];
}
function coinOutcome(input, rng) {
  const choice = input.choice === 'tails' ? 'tails' : 'heads';
  const outcome = rng.pick(['heads', 'tails']);
  return { mode: 'flip', choice, outcome, win: outcome === choice, multiplier: outcome === choice ? 1.98 : 0 };
}

module.exports = {
  crash(input, rng, gate) {
    const target = clampNum(input.target, 1.01, 100, 2);
    const u = Math.max(1e-9, rng.randomFloat());
    let crash = Math.min(100, Math.max(1.01, Math.floor((1 / (1 - u * 0.97)) * 100) / 100));
    if (gate && crash <= target) crash = Math.min(100, Math.max(target + 0.01, Number((target + rng.randomFloat() * 4 + 0.01).toFixed(2))));
    const win = target < crash;
    return { mode: 'cashout', target, crashPoint: crash, win, multiplier: win ? target : 0 };
  },
  mines(input, rng, gate) {
    const mineCount = clampInt(input.mines, 1, 24, 3);
    const picks = [...new Set((Array.isArray(input.picks) ? input.picks : []).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < 25))].slice(0, 12);
    const mineSet = new Set(rng.shuffle([...Array(25).keys()]).slice(0, mineCount));
    let safe = picks.length > 0 && picks.every(p => !mineSet.has(p));
    if (gate && picks.length && !safe) {
      const safeCells = [...Array(25).keys()].filter(x => !mineSet.has(x));
      picks.splice(0, picks.length, ...safeCells.slice(0, Math.min(3, safeCells.length)));
      safe = true;
    }
    const revealed = picks;
    const multiplier = safe && revealed.length ? Number((25 / Math.max(1, 25 - mineCount * 0.9) * Math.pow(1 + mineCount / 10, revealed.length - 1)).toFixed(4)) : 0;
    return { mode: 'grid', mineCount, mines: [...mineSet], revealed, safe, multiplier: safe ? multiplier : 0 };
  },
  plinko(input, rng, gate) {
    const risk = ['low', 'medium', 'high'].includes(input.risk) ? input.risk : 'medium';
    const rows = clampInt(input.rows, 8, 12, 10);
    let path = Array.from({ length: rows }, () => rng.randomInt(0, 1) ? 'R' : 'L');
    let lane = 0;
    for (const p of path) lane += p === 'R' ? 1 : -1;
    const lanes = risk === 'high' ? [0, 0.2, 0.5, 1, 2, 5, 10] : risk === 'low' ? [0.4, 0.7, 1, 1.5, 2, 3, 5] : [0.2, 0.5, 0.8, 1, 1.5, 3, 6];
    let idx = Math.min(lanes.length - 1, Math.abs(lane) % lanes.length);
    if (gate && lanes[idx] < 1) idx = Math.min(lanes.length - 1, idx + 2);
    return { mode: 'path', risk, rows, path, lane, multiplier: lanes[idx] };
  },
  dice(input, rng, gate) {
    const target = clampInt(input.target, 1, 98, 50);
    const direction = input.direction === 'under' ? 'under' : 'over';
    let roll = rng.randomInt(0, 99);
    let win = direction === 'over' ? roll > target : roll < target;
    if (gate && !win) { roll = direction === 'over' ? target + 1 : target - 1; win = true; }
    if (!gate && win && rng.randomFloat() < 0.03) { roll = direction === 'over' ? target : target - 1; win = false; }
    const chance = direction === 'over' ? 99 - target : target;
    return { mode: 'roll', roll, target, direction, win, multiplier: win ? Number((99 / Math.max(1, chance) * 0.98).toFixed(4)) : 0 };
  },
  limbo(input, rng, gate) {
    const target = clampNum(input.target, 1.01, 1000, 2);
    let roll = Number((1 + rng.randomFloat() * 20).toFixed(4));
    if (gate && roll < target) roll = Number((target + rng.randomFloat() * 5 + 0.01).toFixed(4));
    return { mode: 'target', roll, target, win: roll >= target, multiplier: roll >= target ? target : 0 };
  },
  keno(input, rng, gate) {
    const picks = [...new Set((input.picks || []).map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 80))].slice(0, 10);
    const drawn = rng.shuffle(Array.from({ length: 80 }, (_, i) => i + 1)).slice(0, 20);
    let finalDrawn = drawn;
    let hits = picks.filter(n => drawn.includes(n)).length;
    if (gate && picks.length && hits < Math.min(4, picks.length)) {
      const wanted = picks.slice(0, Math.min(4, picks.length));
      finalDrawn = [...new Set([...wanted, ...drawn])].slice(0, 20);
      hits = picks.filter(n => finalDrawn.includes(n)).length;
    }
    const table = [0, 0, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
    return { mode: 'draw', picks, drawn: finalDrawn, hits, multiplier: table[Math.min(hits, 10)] };
  },
  wheel(input, rng, gate) {
    const slots = [0, 0.5, 1, 1.5, 2, 3, 5, 10, 0, 0.5, 1, 2, 0, 5, 0, 25];
    let index = rng.randomInt(0, slots.length - 1);
    if (gate && slots[index] <= 0) index = [2, 4, 5, 6, 9, 10, 11, 13][rng.randomInt(0, 7)];
    return { mode: 'wheel', index, multiplier: slots[index] };
  },
  coinflip(input, rng, gate) {
    const choice = input.choice === 'tails' ? 'tails' : 'heads';
    let outcome = rng.pick(['heads', 'tails']);
    if (gate) outcome = choice;
    return { mode: 'flip', choice, outcome, win: outcome === choice, multiplier: outcome === choice ? 1.98 : 0 };
  },
  blackjack(input, rng, gate) {
    const deck = cards52(rng); const player = [deck[0], deck[2]]; const dealer = [deck[1], deck[3]];
    while (score21(dealer) < 17) dealer.push(deck.shift());
    const playerScore = score21(player); const dealerScore = score21(dealer);
    let result = playerScore > 21 ? 'lose' : dealerScore > 21 || playerScore > dealerScore ? 'win' : playerScore === dealerScore ? 'push' : 'lose';
    if (gate && result === 'lose') result = 'win';
    const multiplier = result === 'win' ? (playerScore === 21 ? 2.5 : 2) : result === 'push' ? 1 : 0;
    return { mode: 'cards', player, dealer, playerScore, dealerScore, result, win: result === 'win', multiplier };
  },
  roulette(input, rng, gate) {
    const bets = new Set(['red', 'black', 'even', 'odd']); const betType = bets.has(input.betType) ? input.betType : 'red';
    let number = rng.randomInt(0, 36);
    const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    if (gate && (betType === 'red' || betType === 'black')) number = [...Array(37).keys()].find(n => n > 0 && (reds.has(n) ? 'red' : 'black') === betType);
    const color = number === 0 ? 'green' : reds.has(number) ? 'red' : 'black';
    let win = betType === color || (betType === 'even' && number > 0 && number % 2 === 0) || (betType === 'odd' && number % 2 === 1);
    if (gate && !win && betType === 'even') number = 2; if (gate && !win && betType === 'odd') number = 1;
    const color2 = number === 0 ? 'green' : reds.has(number) ? 'red' : 'black';
    win = betType === color2 || (betType === 'even' && number > 0 && number % 2 === 0) || (betType === 'odd' && number % 2 === 1);
    const multiplier = win ? 2 : 0;
    return { mode: 'roulette', number, color: color2, betType, win, multiplier };
  },
  baccarat(input, rng, gate) {
    const d = cards52(rng); const value = cards => cards.reduce((s, c) => s + (c.rank > 9 ? 0 : c.rank), 0) % 10;
    const playerCards = [d[0], d[2]], bankerCards = [d[1], d[3]]; let player = value(playerCards), banker = value(bankerCards);
    const result = player > banker ? 'player' : banker > player ? 'banker' : 'tie'; let choice = ['player','banker','tie'].includes(input.choice) ? input.choice : 'player';
    let final = gate ? choice : result; if (gate && choice === 'tie') final = 'tie';
    const win = final === choice; const multiplier = win ? (choice === 'tie' ? 9 : choice === 'banker' ? 1.95 : 2) : 0;
    return { mode: 'cards', player, banker, result: final, choice, win, multiplier };
  },
  sicbo(input, rng, gate) {
    const choice = input.choice === 'dai' ? 'dai' : 'xiu'; let dice = [rng.randomInt(1,6), rng.randomInt(1,6), rng.randomInt(1,6)]; let sum = dice.reduce((a,b)=>a+b,0);
    if (gate) { if (choice === 'dai' && sum < 11) { dice=[4,4,3]; sum=11; } if (choice === 'xiu' && sum > 10) { dice=[3,3,4]; sum=10; } }
    const win = choice === 'dai' ? sum >= 11 && sum <= 17 : sum >= 4 && sum <= 10; return { mode:'dice3', dice, sum, choice, win, multiplier:win?1.95:0 };
  },
  dragontiger(input, rng, gate) {
    const d=cards52(rng); let dragon=d[0].rank, tiger=d[1].rank; const choice=['dragon','tiger','tie'].includes(input.choice)?input.choice:'dragon';
    let result=dragon>tiger?'dragon':tiger>dragon?'tiger':'tie'; if(gate) result=choice; return {mode:'duel',dragon,tiger,result,choice,win:result===choice,multiplier:result===choice?(choice==='tie'?11:2):0};
  },
  videopoker(input,rng,gate) { let d=cards52(rng).slice(0,5); let [hand,mult]=pokerHand(d); if(gate && mult===0) { d=[d[0],d[0],d[1],d[2],d[3]].map((c,i)=>i===1?{...c,rank:d[0].rank}:c); [hand,mult]=pokerHand(d); } return {mode:'poker',cards:d,hand,multiplier:mult}; },
  slot(input,rng,gate) { const symbols=['🍒','🍋','🔔','⭐','7️⃣','💎']; let reels=Array.from({length:5},()=>rng.pick(symbols)); if(gate) reels=['7️⃣','7️⃣','7️⃣',rng.pick(['7️⃣','💎']),rng.pick(['7️⃣','💎'])]; const counts={}; reels.forEach(s=>counts[s]=(counts[s]||0)+1); const top=Math.max(...Object.values(counts)); const multiplier=top===5?50:top===4?10:top===3?3:top===2?1.2:0; return {mode:'reels',reels,multiplier}; },
  bingo(input,rng,gate){ const called=rng.shuffle(Array.from({length:75},(_,i)=>i+1)).slice(0,20); const card=rng.shuffle(Array.from({length:75},(_,i)=>i+1)).slice(0,24); let hits=card.filter(n=>called.includes(n)).length; if(gate && hits<10){ hits=10; } return {mode:'bingo',called,card,hits,win:hits>=10,multiplier:hits>=15?10:hits>=12?7:hits>=10?5:0}; },
  scratch(input,rng,gate){ const symbols=['💰','💎','🍒','⭐','❌']; let cells=Array.from({length:9},()=>rng.pick(symbols)); if(gate) cells=['💎','💎','💎','💎',...cells.slice(4)]; const c={};cells.forEach(s=>c[s]=(c[s]||0)+1); const top=Math.max(...Object.values(c)); return {mode:'scratch',cells,multiplier:top>=5?10:top>=4?5:top>=3?2:0}; },
  hilo(input,rng,gate){ const current=rng.randomInt(1,13); const choice=input.choice==='higher'?'higher':'lower'; let next=rng.randomInt(1,13); if(gate){ next=choice==='higher'?Math.max(current+1,2):Math.min(current-1,12); } const win=choice==='higher'?next>current:next<current; return {mode:'highlow',current,next,choice,win,multiplier:win?1.8:0}; },
  tower(input,rng,gate){ const floors=9, safe=Array.from({length:floors},()=>rng.randomInt(0,2)); const picks=Array.isArray(input.picks)?input.picks.map(Number).filter(n=>n===0||n===1||n===2):[]; let reached=0; for(let i=0;i<Math.min(floors,picks.length);i++){ if(picks[i]===safe[i]) reached++; else break; } if(gate && reached===0) reached=Math.max(1,Math.min(floors,picks.length||1)); return {mode:'tower',floors,reached,multiplier:reached?Number((1+reached*0.75).toFixed(2)):0}; },
  football(input,rng,gate){ const choice=['home','away','draw'].includes(input.choice)?input.choice:'home'; let home=rng.randomInt(0,5),away=rng.randomInt(0,5); let result=home>away?'home':away>home?'away':'draw'; if(gate){ if(choice==='home'){home=Math.max(away+1,1);result='home';}else if(choice==='away'){away=Math.max(home+1,1);result='away';}else{home=away;result='draw';} } const win=result===choice; return {mode:'match',home,away,result,choice,win,multiplier:win?(choice==='draw'?3:2):0}; },
  horse(input,rng,gate){ const horses=Array.from({length:8},(_,i)=>({id:i+1,time:rng.randomInt(800,1600)})).sort((a,b)=>a.time-b.time); const choice=clampInt(input.horse,1,8,1); let winner=horses[0].id; if(gate){ winner=choice; const h=horses.find(x=>x.id===winner); if(h) h.time=700; horses.sort((a,b)=>a.time-b.time); } return {mode:'race',horses,winner,choice,multiplier:winner===choice?6:0}; },
  rocket(input,rng,gate){ return module.exports.crash({target:clampNum(input.target,1.01,100,2)},rng,gate); },
  balloon(input,rng,gate){ const stop=clampNum(input.stop,1.01,20,2); let pop=Number((1+rng.randomFloat()*20).toFixed(2)); if(gate && pop<=stop) pop=Number((stop+1+rng.randomFloat()*3).toFixed(2)); const win=stop<pop; return {mode:'cashout',stop,pop,win,multiplier:win?stop:0}; },
  color(input,rng,gate){ const choice=['red','blue','purple'].includes(input.choice)?input.choice:'red'; let color=rng.weighted([{value:'red',weight:45},{value:'blue',weight:40},{value:'purple',weight:15}]); if(gate) color=choice; const multiplier=color===choice?(choice==='purple'?5:2):0; return {mode:'color',color,choice,win:color===choice,multiplier}; },
  number(input,rng,gate){ const guess=clampInt(input.guess,0,9,0); let target=rng.randomInt(0,9); if(gate) target=guess; return {mode:'guess',target,guess,win:target===guess,multiplier:target===guess?10:0}; },
  rps(input,rng,gate){ const moves=['rock','paper','scissors']; const choice=moves.includes(input.choice)?input.choice:'rock'; let house=rng.pick(moves); if(gate) house=choice==='rock'?'scissors':choice==='paper'?'rock':'paper'; const win=(choice==='rock'&&house==='scissors')||(choice==='paper'&&house==='rock')||(choice==='scissors'&&house==='paper'); const push=choice===house; return {mode:'rps',house,choice,win,push,multiplier:win?1.95:push?1:0}; },
  lottery(input,rng,gate){ const pick=(input.pick||[]).map(Number).filter(n=>n>=0&&n<=9).slice(0,3); let draw=[rng.randomInt(0,9),rng.randomInt(0,9),rng.randomInt(0,9)]; if(gate && pick.length===3) draw=pick.slice(); const exact=pick.length===3&&pick.every((n,i)=>n===draw[i]); const same=pick.length===3&&[...pick].sort().join('')===[...draw].sort().join(''); return {mode:'lottery',draw,pick,exact,same,multiplier:exact?1000:same?100:0}; },
  jackpotwheel(input,rng,gate){ const slots=[0,.5,1,2,3,5,10,25,50,100,0,0,1,2,5,10,25,50,0,1,2,3,5,10,25,50,0,1,2,5,10,25]; let index=rng.randomInt(0,slots.length-1); if(gate&&slots[index]<=0)index=9; return {mode:'wheel',index,multiplier:slots[index],jackpot:index===9}; },
  treasure(input,rng,gate){ const chestCount=25; const chests=rng.shuffle(Array.from({length:chestCount},(_,i)=>i)).slice(0,3); let picks=(input.picks||[]).map(Number).filter(n=>n>=0&&n<chestCount).slice(0,5); let found=picks.filter(x=>chests.includes(x)); if(gate&&found.length===0){ picks=[chests[0]]; found=[chests[0]]; } return {mode:'treasure',chests,found,multiplier:found.length*2}; },
  bottle(input,rng,gate){ const seats=clampInt(input.seats,8,12,10); let index=rng.randomInt(0,seats-1); const multipliers=[0,.5,1,2,5,10]; if(gate&&multipliers[index%6]===0) index=5; return {mode:'wheel',index,seats,multiplier:multipliers[index%6]}; }
};
