const fs=require('fs'),path=require('path'),cp=require('child_process');const root=process.cwd();let checks=[];function ok(n,b,d){checks.push({layer:n,ok:b,detail:d});if(!b)throw new Error(d)}
// 1 structure
for(const f of ['server.js','package.json','render.yaml','Procfile','.env.example','database/schema.sql','frontend/index.html'])ok(1,fs.existsSync(path.join(root,f)),`missing ${f}`);
// 2 registries
const games=require('../data/games'),pets=require('../data/pets.json'),me=require('../data/mechanisms.json'),fe=require('../data/features.json');ok(2,games.length===30&&pets.length===100&&me.length===300&&fe.length===1000,'registry counts');
// 3 syntax
const files=[];(function walk(d){for(const x of fs.readdirSync(d)){const p=path.join(d,x);if(x==='node_modules'||x==='data'||x==='database'){} if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.js'))files.push(p)}})(root);for(const f of files){try{cp.execFileSync(process.execPath,['--check',f],{stdio:'ignore'})}catch{throw new Error('syntax '+f)}}ok(3,true,`${files.length} JS files parsed`);
// 4 security
const crypto=fs.readFileSync(path.join(root,'utils/crypto.js'),'utf8'),auth=fs.readFileSync(path.join(root,'backend/middleware/auth.js'),'utf8');ok(4,crypto.includes('createHmac')&&crypto.includes('timingSafeEqual')&&auth.includes('verifyTelegramInitData'),'telegram HMAC auth present');
// 5 economics
const constants=fs.readFileSync(path.join(root,'config/constants.js'),'utf8'),engine=fs.readFileSync(path.join(root,'backend/services/gameEngine.js'),'utf8');ok(5,constants.includes('MAX_BET_RATIO: 75n')&&constants.includes('WIN_RATE_DEFAULT: 0.45')&&engine.includes('energyCost') && engine.includes('transaction'),'economy/rules present');
// 6 frontend/perf
const perf=fs.readFileSync(path.join(root,'frontend/js/perf.js'),'utf8');ok(6,perf.includes('LITE')&&perf.includes('ULTRA')&&perf.includes('fps<24'),'adaptive perf present');
// 7 deploy
const render=fs.readFileSync(path.join(root,'render.yaml'),'utf8');ok(7,render.includes('healthCheckPath: /health')&&render.includes('startCommand: npm start')&&render.includes('WEBHOOK_URL'),'render config present');
console.log('7-LAYER AUDIT PASSED');for(const c of checks)console.log(`L${c.layer}: PASS — ${c.detail}`);
