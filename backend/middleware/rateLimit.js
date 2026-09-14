const rateLimit=require('express-rate-limit');
const base=(max,windowMs=60000)=>rateLimit({max,windowMs,standardHeaders:'draft-7',legacyHeaders:false});
module.exports={apiLimiter:base(100),authLimiter:base(10),gameLimiter:base(60),chatLimiter:base(20),adminLimiter:base(30)};
