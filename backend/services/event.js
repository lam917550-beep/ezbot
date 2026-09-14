'use strict';

const db = require('../../database/db');
const { nowSec } = require('../../utils/time');

function getActiveEvents() {
  const now = nowSec();
  return db.prepare('SELECT * FROM events WHERE active=1 AND start_at<=? AND end_at>=? ORDER BY start_at ASC').all(now, now);
}

function createEvent(data) {
  const result = db.prepare(
    'INSERT INTO events(code,name,description,icon,start_at,end_at,active,config,created_at,updated_at) VALUES(?,?,?,?,?,?,0,?,?,?)'
  ).run(
    data.code,
    data.name,
    data.description || '',
    data.icon || '🎉',
    Number(data.startAt),
    Number(data.endAt),
    JSON.stringify(data.config || {}),
    nowSec(),
    nowSec()
  );
  return db.prepare('SELECT * FROM events WHERE id=?').get(result.lastInsertRowid);
}

function startEvent(code) {
  return db.prepare('UPDATE events SET active=1, updated_at=? WHERE code=?').run(nowSec(), code).changes > 0;
}

function stopEvent(code) {
  return db.prepare('UPDATE events SET active=0, updated_at=? WHERE code=?').run(nowSec(), code).changes > 0;
}

function getEventMultiplier() {
  return 1;
}

module.exports = { getActiveEvents, createEvent, startEvent, stopEvent, getEventMultiplier };
