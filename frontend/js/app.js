import { api, auth, getToken, setToken } from './api.js';
import { detectTier, startAdaptiveTier, startFpsMonitor } from './perf.js';
import { connectSocket } from './socket.js';
import { route, go } from './router.js';
import { money, esc } from './utils.js';
import { mountTopbar } from './ui/topbar.js';
import { mountSidebar } from './ui/sidebar.js';

import * as crash from './games/crash.js';
import * as mines from './games/mines.js';
import * as plinko from './games/plinko.js';
import * as dice from './games/dice.js';
import * as limbo from './games/limbo.js';
import * as keno from './games/keno.js';
import * as wheel from './games/wheel.js';
import * as coinflip from './games/coinflip.js';
import * as blackjack from './games/blackjack.js';
import * as roulette from './games/roulette.js';
import * as baccarat from './games/baccarat.js';
import * as sicbo from './games/sicbo.js';
import * as dragontiger from './games/dragontiger.js';
import * as videopoker from './games/videopoker.js';
import * as slot from './games/slot.js';
import * as bingo from './games/bingo.js';
import * as scratch from './games/scratch.js';
import * as hilo from './games/hilo.js';
import * as tower from './games/tower.js';
import * as football from './games/football.js';
import * as horse from './games/horse.js';
import * as rocket from './games/rocket.js';
import * as balloon from './games/balloon.js';
import * as color from './games/color.js';
import * as number from './games/number.js';
import * as rps from './games/rps.js';
import * as lottery from './games/lottery.js';
import * as jackpotwheel from './games/jackpotwheel.js';
import * as treasure from './games/treasure.js';
import * as bottle from './games/bottle.js';

const registry = new Map([
  crash, mines, plinko, dice, limbo, keno, wheel, coinflip, blackjack, roulette,
  baccarat, sicbo, dragontiger, videopoker, slot, bingo, scratch, hilo, tower,
  football, horse, rocket, balloon, color, number, rps, lottery, jackpotwheel,
  treasure, bottle
].map(mod => [mod.default?.meta?.code || inferCode(mod), mod.createGame]));
function inferCode(mod){ return Object.keys(mod).find(k=>typeof mod[k]==='function')?.replace('createGame','') || ''; }

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
document.body.dataset.tier = detectTier();
startAdaptiveTier(tier => { document.body.dataset.tier = tier; });
startFpsMonitor(fps => { window.__casinoFps = fps; });

const state = { user:null, energy:null, level:null, pet:null, games:[], pets:[], route:'home' };
const splash = document.querySelector('#splash');
const main = document.querySelector('#main');

function safeObject(obj){ return obj && typeof obj==='object' ? obj : {}; }
function normalizeInput(input){
  const out={...input};
  for(const k of ['picks']){
    if(typeof out[k]==='string') out[k]=out[k].split(',').map(v=>Number(v.trim())).filter(Number.isFinite);
  }
  if(typeof out.pick==='string' && /^\d{3}$/.test(out.pick)) out.pick=out.pick.split('').map(Number);
  if(typeof out.betType==='undefined' && out.choice) out.betType=out.choice;
  return out;
}
async function refresh(){
  const me=await api('/api/me');
  state.user=me.user; state.energy=me.energy; state.level=me.level; state.pet=me.pet;
}
async function boot(){
  try{
    let user=null;
    if(getToken()) { try { user=(await api('/api/me')).user; } catch { setToken(''); } }
    if(!user){
      const init=tg?.initData||'';
      if(init) user=await auth(init);
      else if(location.hostname==='localhost'){ user=(await api('/api/me',{headers:{'x-dev-user-id':'1'}})).user; }
      else throw new Error('Hãy mở ứng dụng bằng Telegram Mini App để xác thực.');
    }
    const [games,pets,me]=await Promise.all([api('/api/games'),api('/api/pets'),api('/api/me')]);
    Object.assign(state,{user:me.user,games,pets,energy:me.energy,level:me.level,pet:me.pet});
    splash?.classList.add('hidden'); main?.classList.remove('hidden');
    if(!me.user.display_name) showOnboarding(); else render();
    window.addEventListener('hashchange',render); connectSocket?.();
  }catch(error){
    const p=splash?.querySelector('p'); if(p)p.textContent=error.message;
  }
}
function render(){
  const r=route(); state.route=r;
  if(r.startsWith('game/')) return renderGame(r.slice(5));
  main.innerHTML=baseLayout();
  mountTopbar?.(document.querySelector('[data-topbar]'),state);
  mountSidebar?.(document.querySelector('[data-sidebar]'),go);
  bindNav();
  const c=document.querySelector('#content');
  if(r==='pets') return renderPets(c);
  if(r==='leaderboard') return renderBoard(c);
  if(r==='profile') return renderProfile(c);
  if(r==='history') return renderHistory(c);
  if(r==='quests') return renderQuests(c);
  if(r==='bank') return renderBank(c);
  return renderHome(c);
}
function baseLayout(){return `<div data-topbar></div><div class="layout"><aside data-sidebar class="sidebar"></aside><main id="content" class="content"></main></div><nav class="bottom-nav"><button data-route="home">🎰<small>Game</small></button><button data-route="pets">🐾<small>Pet</small></button><button data-route="leaderboard">🏆<small>BXH</small></button><button data-route="profile">👤<small>Hồ sơ</small></button></nav>`}
function bindNav(){document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));}
function renderHome(c){
  c.innerHTML=`<section class="hero panel"><div><div class="eyebrow">CASINO MINI APP</div><h1>🎰 Sàn game server-side</h1><p>30 game thật, kết quả do backend xử lý, ví và lịch sử lưu DB.</p></div><div class="hero-stats"><span>💰 ${money(state.user.balance)}</span><span>⚡ ${state.energy.current}/${state.energy.max}</span><span>🎯 Lv ${state.user.level}</span></div></section><div class="section-title"><span>Game</span><span class="muted">Min 10.000 • Max 75%</span></div><div class="game-grid">${state.games.map(g=>`<button class="game-card panel" data-game="${esc(g.code)}"><span class="game-art">${g.icon}</span><strong>${esc(g.name)}</strong><small>${esc(g.risk)} · ${esc(g.mode)}</small></button>`).join('')}</div>`;
  c.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>go('game/'+b.dataset.game));
}
async function renderGame(code){
  main.innerHTML=`<div class="game-page"><button class="btn back" data-back>← Game Hub</button><div id="game-host"></div></div>`;
  document.querySelector('[data-back]').onclick=()=>go('home');
  const mod=registry.get(code); if(!mod){document.querySelector('#game-host').textContent='Game không tồn tại';return;}
  const game=state.games.find(x=>x.code===code)||{};
  const host=document.querySelector('#game-host');
  mod(host,{...game,play:async(code,amount,input)=>{const result=await api('/api/game/play',{method:'POST',body:JSON.stringify({game:code,amount:String(amount),input:normalizeInput(input)})});state.user.balance=result.balance;state.energy=result.energy;state.level=result.level;return result;}});
}
async function renderPets(c){const pets=await api('/api/pets');c.innerHTML=`<div class="section-title"><span>🐾 Pet Shop</span><span class="muted">${pets.length}/100</span></div><div class="game-grid">${pets.map(p=>`<article class="pet-card panel"><div class="pet-icon">${p.icon}</div><strong>${esc(p.name)}</strong><small>${p.rarity}</small><div>💰 +${esc(p.money_bonus)}% · XP +${esc(p.xp_bonus)}%</div><div class="muted">${money(p.price)} xu</div><button class="btn primary full" data-buy="${esc(p.id)}">MUA</button></article>`).join('')}</div>`;c.querySelectorAll('[data-buy]').forEach(b=>b.onclick=async()=>{try{await api('/api/pets/buy',{method:'POST',body:JSON.stringify({petId:b.dataset.buy})});await refresh();render();}catch(e){alert(e.message)}})}
async function renderBoard(c){const d=await api('/api/leaderboard/money');c.innerHTML=`<div class="section-title"><span>🏆 BXH</span><span class="muted">Top 100</span></div><div class="panel list">${d.map((u,i)=>`<div class="list-row"><b>#${i+1}</b><span>${esc(u.display_name||u.username||u.id)}</span><strong>${money(u.balance)}</strong></div>`).join('')}</div>`}
function renderProfile(c){c.innerHTML=`<section class="panel profile"><div class="avatar">${state.user.avatar?'🧑':'👤'}</div><h2>${esc(state.user.display_name||'Chưa đặt tên')}</h2><p class="muted">@${esc(state.user.username||'unknown')}</p><div class="stat-grid"><span>Level <b>${state.user.level}</b></span><span>XP <b>${state.user.xp}/1000</b></span><span>Win <b>${state.user.total_wins}</b></span><span>Wagered <b>${money(state.user.total_wagered)}</b></span></div><p>Bio: ${esc(state.user.bio||'Chưa có bio')}</p></section>`}
async function renderHistory(c){const bets=await api('/api/bets');c.innerHTML=`<div class="section-title"><span>📜 Lịch sử cược</span></div><div class="panel list">${bets.map(b=>`<div class="list-row"><span>${esc(b.game)}</span><span>${money(b.amount)}</span><b class="${b.result==='win'?'win':'loss'}">${b.result==='win'?'+'+money(b.payout):'-'}</b></div>`).join('')}</div>`}
async function renderQuests(c){const qs=await api('/api/quests');c.innerHTML=`<div class="section-title"><span>🎯 Nhiệm vụ</span></div><div class="list">${qs.map(q=>`<article class="panel quest"><div><b>${q.icon} ${esc(q.title)}</b><p>${esc(q.description||'')}</p></div><span>${q.progress}/${q.target}</span>${q.completed&&!q.claimed?`<button class="btn primary" data-claim="${q.id}">NHẬN</button>`:''}</article>`).join('')}</div>`;c.querySelectorAll('[data-claim]').forEach(b=>b.onclick=async()=>{await api('/api/quests/'+b.dataset.claim,{method:'POST'});renderQuests(c)})}
async function renderBank(c){const b=await api('/api/bank');c.innerHTML=`<section class="panel bank"><div class="section-title"><span>🏦 Ngân hàng</span></div><div class="bank-balance">${money(b.bank)} xu</div><div class="row"><input id="bank-amount" inputmode="numeric" value="10000"><button class="btn primary" id="deposit">Gửi</button><button class="btn" id="withdraw">Rút</button></div><small class="muted">Lãi/ngày: ${(b.interestRate*100).toFixed(2)}% · phí rút: ${(b.withdrawFee*100).toFixed(2)}%</small></section>`;const input=c.querySelector('#bank-amount');c.querySelector('#deposit').onclick=async()=>{await api('/api/bank/deposit',{method:'POST',body:JSON.stringify({amount:input.value})});await refresh();renderBank(c)};c.querySelector('#withdraw').onclick=async()=>{await api('/api/bank/withdraw',{method:'POST',body:JSON.stringify({amount:input.value})});await refresh();renderBank(c)}}
function showOnboarding(){main.innerHTML=`<section class="panel onboarding"><div class="onboard-icon">🎰</div><h2>Chào mừng</h2><p>Đặt tên hiển thị duy nhất. Lần đầu miễn phí.</p><input id="first-name" maxlength="32" placeholder="Tên của bạn"><button id="save-first-name" class="btn primary full">BẮT ĐẦU CHƠI</button><div id="first-name-error" class="loss"></div></section>`;const input=document.querySelector('#first-name');document.querySelector('#save-first-name').onclick=async()=>{try{await api('/api/profile/name',{method:'PATCH',body:JSON.stringify({name:input.value.trim()})});await refresh();render()}catch(e){document.querySelector('#first-name-error').textContent=e.message}};input.focus()}
if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
boot();
