module.exports=io=>{io.on('connection',socket=>socket.on('chat:send',m=>io.to('chat:'+String(m.channelId)).emit('chat:new',m)))};
