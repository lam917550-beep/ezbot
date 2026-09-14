const fs=require('fs'); const Database=require('better-sqlite3'); const config=require('../config/config');
fs.mkdirSync(require('path').dirname(config.dbPath),{recursive:true});
const db=new Database(config.dbPath);
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.pragma('synchronous = NORMAL');
module.exports=db;
