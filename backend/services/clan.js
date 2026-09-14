const db=require('../../database/db');
module.exports={
 createClan:(u,n,t,d)=>{const r=db.prepare('INSERT INTO clans(name,tag,description,owner_id) VALUES(?,?,?,?)').run(n,t||'',d||'',u);db.prepare("INSERT INTO clan_members(clan_id,user_id,role) VALUES(?,?,'owner')").run(r.lastInsertRowid,u);db.prepare('UPDATE users SET clan_id=? WHERE id=?').run(r.lastInsertRowid,u);return r.lastInsertRowid},
 joinClan:(u,c)=>db.prepare('INSERT INTO clan_members(clan_id,user_id) VALUES(?,?)').run(c,u).changes>0,
 leaveClan:u=>db.prepare('DELETE FROM clan_members WHERE user_id=?').run(u).changes>0,
 kickMember:()=>false,promoteMember:()=>false,donateToClan:()=>false,
 getClanInfo:c=>db.prepare('SELECT * FROM clans WHERE id=?').get(c),
 getClanMembers:c=>db.prepare('SELECT * FROM clan_members WHERE clan_id=?').all(c),
 getUserClan:u=>db.prepare('SELECT c.* FROM clans c JOIN users u ON u.clan_id=c.id WHERE u.id=?').get(u)||null,
 listClans:(l,o)=>db.prepare('SELECT * FROM clans ORDER BY level DESC LIMIT ? OFFSET ?').all(Math.min(Number(l)||50,100),Number(o)||0)
};
