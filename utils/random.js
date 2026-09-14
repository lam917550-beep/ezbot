const crypto=require('crypto');
function randomInt(min,max){ if(max<min) throw new Error('Invalid range'); return crypto.randomInt(min,max+1); }
function randomFloat(){ return Number(crypto.randomBytes(6).readUIntBE(0,6))/0x1000000000000; }
function shuffle(arr){const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=randomInt(0,i);[a[i],a[j]]=[a[j],a[i]];} return a;}
const pickRandom=a=>a[randomInt(0,a.length-1)];
function pickWeighted(items,weights){const total=weights.reduce((a,b)=>a+b,0);let r=randomFloat()*total;for(let i=0;i<items.length;i++){r-=weights[i];if(r<0)return items[i];}return items.at(-1);}
module.exports={randomInt,randomFloat,shuffle,pickRandom,pickWeighted};
