const db=require('./db'); const fs=require('fs');
const sql=fs.readFileSync(__dirname+'/schema.sql','utf8'); db.exec(sql); console.log('Migration 001 OK');
