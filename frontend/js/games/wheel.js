import { mountGame } from './gameView.js';
const meta={code:'wheel',name:'Vòng Quay',icon:'🎡',risk:'Tùy',description:'Vòng quay nhiều ô hệ số.',preview:'16 ô hệ số.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
