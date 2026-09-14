import { audio } from '../audio.js';
import { haptic } from '../haptic.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountGame(host, meta, ctx) {
  const controls = (meta.controls || []).map(controlHtml).join('');
  host.innerHTML = `
    <section class="game-shell ${esc(meta.theme || 'default')}">
      <div class="panel game-card-shell">
        <div class="game-head"><div><span class="game-icon">${meta.icon}</span><div><div class="game-title">${esc(meta.name)}</div><div class="muted">${esc(meta.description || '')}</div></div></div><span class="risk-pill">${esc(meta.risk || 'Tùy')}</span></div>
        <div class="game-stage"><canvas data-canvas width="960" height="440"></canvas><div class="stage-overlay" data-stage></div></div>
        <div class="controls-grid">
          <label class="field"><span>Cược</span><input data-bet inputmode="numeric" value="10000" min="10000"></label>
          <div class="quick-bets"><button class="chip" data-q="10000">10K</button><button class="chip" data-q="100000">100K</button><button class="chip" data-q="1000000">1M</button><button class="chip" data-q="10000000">10M</button></div>
          ${controls}
        </div>
        <div class="game-actions"><button class="btn primary full" data-play>🎰 CHƠI NGAY</button><div class="game-result muted" data-result>Chọn cược rồi chơi.</div></div>
        <div class="game-footer"><span>Server quyết định kết quả</span><span>Max cược 75%</span><span>Phí/hệ số theo game</span></div>
      </div>
    </section>`;

  const canvas = host.querySelector('[data-canvas]');
  const ctx2d = canvas?.getContext('2d', { alpha: false, desynchronized: true });
  let raf = 0;
  let phase = 0;
  function draw(preview = true) {
    if (!ctx2d) return;
    const w = canvas.width, h = canvas.height;
    ctx2d.fillStyle = '#07101f'; ctx2d.fillRect(0,0,w,h);
    phase += 0.02;
    ctx2d.strokeStyle = 'rgba(125,150,220,.16)'; ctx2d.lineWidth = 1;
    for (let x=0;x<=w;x+=80){ctx2d.beginPath();ctx2d.moveTo(x,0);ctx2d.lineTo(x,h);ctx2d.stroke()}
    for (let y=0;y<=h;y+=55){ctx2d.beginPath();ctx2d.moveTo(0,y);ctx2d.lineTo(w,y);ctx2d.stroke()}
    ctx2d.fillStyle = 'rgba(110,140,255,.22)';
    const pulse = 1 + Math.sin(phase * 2) * 0.08;
    ctx2d.beginPath(); ctx2d.arc(w/2,h/2,72*pulse,0,Math.PI*2); ctx2d.fill();
    ctx2d.font='700 52px system-ui'; ctx2d.textAlign='center'; ctx2d.textBaseline='middle'; ctx2d.fillStyle='#fff'; ctx2d.fillText(meta.icon,w/2,h/2);
    ctx2d.font='600 18px system-ui';ctx2d.fillStyle='rgba(255,255,255,.62)';ctx2d.fillText(preview?meta.preview:'RESULT',w/2,h/2+80);
    raf=requestAnimationFrame(()=>draw(preview));
  }
  draw(true);

  host.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', ()=>{host.querySelector('[data-bet]').value=btn.dataset.q; haptic.light();}));
  host.querySelector('[data-play]').addEventListener('click', async () => {
    const button=host.querySelector('[data-play]');
    const result=host.querySelector('[data-result]');
    button.disabled=true; result.textContent='Đang xử lý trên server…'; result.className='game-result muted';
    try {
      const input={};
      host.querySelectorAll('[data-input]').forEach(el => { if(el.type==='checkbox') input[el.name]=el.checked; else input[el.name]=el.value; });
      const amount=host.querySelector('[data-bet]').value;
      const data=await ctx.play(meta.code, amount, input);
      renderResult(host, meta, data);
    } catch (error) {
      result.textContent='❌ '+error.message; result.className='game-result loss'; audio.error?.(); haptic.error?.();
    } finally { button.disabled=false; }
  });
  return { destroy(){cancelAnimationFrame(raf);} };
}

function controlHtml(c){
  if(c.type==='select') return `<label class="field"><span>${esc(c.label)}</span><select data-input name="${esc(c.name)}">${c.options.map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('')}</select></label>`;
  if(c.type==='number') return `<label class="field"><span>${esc(c.label)}</span><input data-input name="${esc(c.name)}" type="number" step="${c.step||1}" min="${c.min??''}" max="${c.max??''}" value="${esc(c.value ?? '')}"></label>`;
  if(c.type==='text') return `<label class="field"><span>${esc(c.label)}</span><input data-input name="${esc(c.name)}" value="${esc(c.value ?? '')}" maxlength="${c.maxLength||64}"></label>`;
  if(c.type==='buttons') return `<div class="field"><span>${esc(c.label)}</span><div class="choice-row">${c.options.map((x,i)=>`<label class="choice"><input data-input name="${esc(c.name)}" type="radio" value="${esc(x.value)}" ${i===0?'checked':''}><span>${esc(x.label)}</span></label>`).join('')}</div></div>`;
  return '';
}

function renderResult(host, meta, data){
  const r=data.result||{}; const result=host.querySelector('[data-result]');
  const win=Boolean(r.win)||Number(r.multiplier||0)>0;
  const payout=String(r.payout||'0');
  result.className='game-result '+(win?'win':'loss');
  result.innerHTML=`<strong>${win?'✅ THẮNG':'❌ THUA'}</strong> · ${win?'x'+esc(r.multiplier):'0x'} · Nhận: ${esc(payout)} xu`;
  const stage=host.querySelector('[data-stage]');
  stage.innerHTML=buildDetails(r);
  audio[win?'win':'lose']?.(); haptic[win?'success':'error']?.();
  const canvas=host.querySelector('[data-canvas]');
  if(canvas){ canvas.classList.remove('result-flash'); void canvas.offsetWidth; canvas.classList.add('result-flash'); }
}
function buildDetails(r){
  const entries=[];
  for(const [key,val] of Object.entries(r)){if(['payout','win','multiplier','mines','safe','crashPoint','target'].includes(key))continue; if(typeof val==='object')entries.push(`<div class="detail"><b>${esc(key)}</b><span>${esc(JSON.stringify(val))}</span></div>`); else entries.push(`<div class="detail"><b>${esc(key)}</b><span>${esc(val)}</span></div>`)}
  return entries.slice(0,7).join('');
}
