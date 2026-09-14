function log(level,message,meta={}){console.log(JSON.stringify({time:new Date().toISOString(),level,message,meta}));}
module.exports={info:(m,x)=>log('info',m,x),warn:(m,x)=>log('warn',m,x),error:(m,x)=>log('error',m,x)};
