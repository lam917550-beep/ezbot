const {verifyInitData}=require('../../utils/crypto'); const config=require('../../config/config');
const cache=new Map();
module.exports=function(req,res,next){try{const initData=req.get('X-Init-Data')||req.body?.initData; if(!initData) return res.status(401).json({error:'No initData',code:'AUTH_REQUIRED'}); const key=initData; const hit=cache.get(key); let r=hit&&Date.now()-hit.time<300000?hit.result:null; if(!r){r=verifyInitData(initData,config.BOT_TOKEN); if(r.valid) cache.set(key,{time:Date.now(),result:r});} if(!r.valid) return res.status(401).json({error:r.reason,code:'INVALID_INIT_DATA'}); req.user=r.user; req.telegramId=String(r.user.id); next();}catch(e){next(e)}};
module.exports.clear=()=>cache.clear();
