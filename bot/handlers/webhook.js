module.exports=(app,bot)=>{app.post('/webhook',(req,res,next)=>bot.handleUpdate(req.body,res).catch(next));};
