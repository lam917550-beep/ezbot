const db=require('../../database/db');
module.exports={
 createOffer:(f,t,o,r)=>{const x=db.prepare('INSERT INTO trade_offers(from_user,to_user,offer_items,request_items) VALUES(?,?,?,?)').run(f,t,JSON.stringify(o||{}),JSON.stringify(r||{}));return x.lastInsertRowid},
 acceptOffer:()=>false,
 declineOffer:(u,id)=>db.prepare("UPDATE trade_offers SET status='declined' WHERE id=? AND to_user=? AND status='pending'").run(id,u).changes>0,
 cancelOffer:(u,id)=>db.prepare("UPDATE trade_offers SET status='cancelled' WHERE id=? AND from_user=? AND status='pending'").run(id,u).changes>0,
 getOffers:u=>db.prepare('SELECT * FROM trade_offers WHERE (from_user=? OR to_user=?) ORDER BY id DESC').all(u,u)
};
