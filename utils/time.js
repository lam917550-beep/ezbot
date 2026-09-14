const nowSec=()=>Math.floor(Date.now()/1000);
const hoursLeft=(until)=>Math.max(0,Math.ceil((until*1000-Date.now())/3600000));
module.exports={nowSec,hoursLeft};
