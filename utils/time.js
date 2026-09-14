function now(){return Math.floor(Date.now()/1000)}
function dayKey(ts=now(),offsetHours=7){return Math.floor((ts+offsetHours*3600)/86400)}
module.exports={now,dayKey};
