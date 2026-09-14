const {verifyTelegramInitData}=require('../../utils/crypto'); const config=require('../../config/config'); const {upsertUser,issueToken}=require('../middleware/auth');
module.exports=(app)=>app.post('/api/auth',(req,res)=>{const v=verifyTelegramInitData(String(req.body?.initData||''),config.botToken);if(!v.ok)return res.status(401).json({error:v.error,code:'AUTH_FAILED'});const user=upsertUser(v.user);res.json({token:issueToken(user.id),user:sanitize(user)})});
function sanitize(u){const x={...u};try{x.settings=JSON.parse(u.settings||'{}')}catch{x.settings={}}return x}
