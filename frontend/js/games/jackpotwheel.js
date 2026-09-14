import { mountGame } from './gameView.js';
const meta={code:'jackpotwheel',name:'Jackpot Wheel',icon:'💰',risk:'Cao',description:'Vòng quay hệ số lớn có ô jackpot.',preview:'32 ô.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
