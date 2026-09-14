export function money(v){try{return BigInt(String(v??0)).toLocaleString('vi-VN')}catch{return String(v??0)}}
export function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
