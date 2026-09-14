import { mountGame } from './gameView.js';
const meta={code:'videopoker',name:'Video Poker',icon:'♠️',risk:'Trung',description:'Deal một hand poker 5 lá và trả theo hand.',preview:'Poker hand evaluator.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
