const crypto=require('crypto');
function verifyInitData(initData,botToken,maxAge=86400){
  if(typeof initData!=='string'||!initData) return {valid:false,reason:'missing initData'};
  const params=new URLSearchParams(initData), hash=params.get('hash'); if(!hash||!/^[a-f0-9]{64}$/i.test(hash)) return {valid:false,reason:'invalid hash'};
  params.delete('hash');
  const dataCheckString=Array.from(params.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
  const secretKey=crypto.createHmac('sha256','WebAppData').update(botToken).digest();
  const calc=crypto.createHmac('sha256',secretKey).update(dataCheckString).digest();
  const supplied=Buffer.from(hash,'hex'); if(supplied.length!==calc.length||!crypto.timingSafeEqual(calc,supplied)) return {valid:false,reason:'hash mismatch'};
  const authDate=Number(params.get('auth_date')); if(!Number.isFinite(authDate)) return {valid:false,reason:'invalid auth_date'};
  const age=Math.floor(Date.now()/1000)-authDate; if(age<0||age>maxAge) return {valid:false,reason:'initData expired'};
  let user; try{ user=JSON.parse(params.get('user')||'null'); }catch{ return {valid:false,reason:'invalid user'} }
  if(!user||!user.id) return {valid:false,reason:'no user'};
  return {valid:true,user,authDate};
}
function sha256Hex(value){return crypto.createHash('sha256').update(value).digest('hex');}
module.exports={verifyInitData,sha256Hex};
