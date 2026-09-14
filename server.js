const express=require('express');const http=require('http');const path=require('path');const helmet=require('helmet');const compression=require('compression');const cors=require('cors');const {Server}=require('socket.io');const config=require('./config/config');const fs=require('fs');const db=require('./database/db');
db.exec(fs.readFileSync(path.join(__dirname,'database/schema.sql'),'utf8'));require('./database/seed');
const app=express();const server=http.createServer(app);const io=new Server(server,{cors:{origin:config.WEBAPP_URL,methods:['GET','POST']},perMessageDeflate:true});
app.set('trust proxy',1);app.use(helmet({contentSecurityPolicy:false}));app.use(compression());app.use(cors({origin:config.WEBAPP_URL}));app.use(express.json({limit:'256kb'}));app.use(express.urlencoded({extended:false,limit:'256kb'}));app.use(express.static(path.join(__dirname,'frontend'),{maxAge:'1y',etag:true}));
app.get('/health',(req,res)=>res.status(200).json({ok:true,ts:Date.now()}));
require('./backend/routes/auth')(app);require('./backend/routes/api')(app);require('./backend/routes/game')(app);require('./backend/routes/admin')(app);require('./backend/sockets')(io);
require('./bot')(app);
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'frontend','index.html')));
server.listen(config.PORT,()=>console.log(`Server running on ${config.PORT}`));
