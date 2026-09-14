const crypto=require('crypto'); const {randomInt,randomFloat,shuffle,pickRandom}=require('../../utils/random'); const db=require('../../database/db'); const C=require('../../config/constants');
function rollWin(userId){const row=db.prepare('SELECT win_rate_override FROM users WHERE id=?').get(userId); const rate=row&&row.win_rate_override!=null?Math.max(0,Math.min(1,Number(row.win_rate_override)/100)):C.DEFAULT_WIN_RATE; return randomFloat()<rate;}
function generateServerSeed(){return crypto.randomBytes(32).toString('hex')}
function hashSeed(s){return crypto.createHash('sha256').update(s).digest('hex')}
function verifyFair(serverSeed,clientSeed,nonce){const hex=crypto.createHmac('sha256',serverSeed).update(`${clientSeed}:${nonce}`).digest('hex').slice(0,13); return parseInt(hex,16)/0x1fffffffffffff}
module.exports={rollWin,randomInt,randomFloat,shuffle,pickRandom,generateServerSeed,hashSeed,verifyFair};
