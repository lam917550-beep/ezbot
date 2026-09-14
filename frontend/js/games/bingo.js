import { mountGame } from './gameView.js';
const meta={code:'bingo',name:'Bingo',icon:'🎟️',risk:'Thấp',description:'Bảng 24 số và 20 số được gọi.',preview:'Bingo draw.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
