function formatNumber(n){return new Intl.NumberFormat('vi-VN').format(Number(n)||0)}
function safeName(s){return String(s||'').trim().replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,32)}
module.exports={formatNumber,safeName};
