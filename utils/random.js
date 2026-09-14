const crypto=require('crypto');
function randomInt(min,max){if(min>max) throw new Error('invalid range'); return crypto.randomInt(min,max+1)}
function randomFloat(){return crypto.randomInt(0,1_000_000_000)/1_000_000_000}
function pickRandom(a){if(!a.length) return undefined; return a[randomInt(0,a.length-1)]}
function shuffle(a){const out=[...a]; for(let i=out.length-1;i>0;i--){const j=randomInt(0,i); [out[i],out[j]]=[out[j],out[i]]} return out}
module.exports={randomInt,randomFloat,pickRandom,shuffle};
