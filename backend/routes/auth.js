const Joi=require('joi');
const db=require('../../database/db');
const C=require('../../config/constants');
const {verifyInitData}=require('../../utils/crypto');
const {now,dayKey}=require('../../utils/time');

module.exports=(app)=>{
  app.post('/api/auth',(req,res,next)=>{
    try{
      const valid=Joi.object({initData:Joi.string().min(1).required()}).validate(req.body);
      if(valid.error) return res.status(400).json({error:'initData required',code:'VALIDATION_ERROR'});
      const r=verifyInitData(valid.value.initData,require('../../config/config').BOT_TOKEN);
      if(!r.valid) return res.status(401).json({error:r.reason,code:'INVALID_INIT_DATA'});
      const id=String(r.user.id);
      let u=db.prepare('SELECT * FROM users WHERE id=?').get(id);
      let isNew=false;
      if(!u){
        db.prepare('INSERT INTO users(id,username,avatar,balance,energy,login_streak,max_login_streak,last_login,last_energy_regen) VALUES(?,?,?,?,?,?,?,?,?)')
          .run(id,r.user.username||null,r.user.photo_url||null,C.START_BALANCE,C.START_ENERGY,1,1,now(),now());
        db.prepare('INSERT INTO user_settings(user_id) VALUES(?)').run(id);
        isNew=true;
      }else{
        const prev=dayKey(u.last_login), today=dayKey();
        const streak=today>prev+1?1:today>prev?u.login_streak+1:u.login_streak;
        db.prepare('UPDATE users SET username=?,avatar=?,login_streak=?,max_login_streak=CASE WHEN ?>max_login_streak THEN ? ELSE max_login_streak END,last_login=?,updated_at=? WHERE id=?')
          .run(r.user.username||null,r.user.photo_url||null,streak,streak,streak,now(),now(),id);
      }
      u=db.prepare('SELECT * FROM users WHERE id=?').get(id);
      const settings=db.prepare('SELECT * FROM user_settings WHERE user_id=?').get(id);
      res.json({user:u,settings,isNew});
    }catch(e){next(e)}
  });
};
