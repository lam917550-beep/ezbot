function toBigInt(value) { return typeof value === 'bigint' ? value : BigInt(String(value || 0)); }
function money(value) { return toBigInt(value).toLocaleString('en-US'); }
function clampNumber(v,min,max){ const n=Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min,n)) : min; }
function safeJson(value){ return JSON.stringify(value, (_,v)=>typeof v==='bigint'?v.toString():v); }
module.exports={toBigInt,money,clampNumber,safeJson};
