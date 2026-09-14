import { mountGame } from './gameView.js';
const meta={code:'scratch',name:'Scratch Card',icon:'🎫',risk:'Tùy',description:'Mở 9 ô; ghép biểu tượng để nhận hệ số.',preview:'9 ô.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
