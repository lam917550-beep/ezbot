const db=require('../../database/db'); const C=require('../../config/constants'); const eco=require('./economy'); const pet=require('./pet'); const {randomInt}=require('./rng');
function addXP(id,xp){let u=db.prepare('SELECT level,xp FROM users WHERE id=?').get(String(id));let level=u.level,x=u.xp+Number(xp),leveledUp=false;while(x>=C.XP_PER_LEVEL){x-=C.XP_PER_LEVEL;level++;leveledUp=true;onLevelUp(id,level)}db.prepare('UPDATE users SET level=?,xp=?,updated_at=? WHERE id=?').run(level,x,Math.floor(Date.now()/1000),String(id));return {level,xp:x,leveledUp}}
function onLevelUp(id,level){const r=C.MILESTONES[level];if(!r)return;if(r.money)eco.addBalance(id,r.money,'milestone',`level:${level}`);if(r.petId){try{pet.addPetToUser(id,r.petId)}catch{}}}
function getLevel(id){const u=db.prepare('SELECT level,xp FROM users WHERE id=?').get(String(id));return {level:u.level,xp:u.xp,xpNeeded:C.XP_PER_LEVEL}}
function addWinXP(id){return addXP(id,randomInt(C.XP_MIN_WIN,C.XP_MAX_WIN))}
module.exports={addXP,getLevel,onLevelUp,addWinXP,getMilestoneReward:(l)=>C.MILESTONES[l]||null};
