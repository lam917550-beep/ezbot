import { mountGame } from './gameView.js';
const meta={code:'slot',name:'Slot 5 Trục',icon:'🎰',risk:'Tùy',description:'5 reel, trả thưởng theo số biểu tượng trùng.',preview:'5 reels.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
