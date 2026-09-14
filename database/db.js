const Database=require('better-sqlite3');
const fs=require('fs'); const path=require('path');
const dir=path.join(__dirname,'..','data'); fs.mkdirSync(dir,{recursive:true});
const db=new Database(path.join(dir,'casino.db'));
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.pragma('synchronous = NORMAL'); db.pragma('busy_timeout = 5000');
module.exports=db;
