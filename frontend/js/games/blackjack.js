import { mountGame } from './gameView.js';
const meta={code:'blackjack',name:'Blackjack',icon:'🃏',risk:'Trung',description:'Dealer rút tới 17, so điểm với người chơi.',preview:'21 điểm.',controls:[]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
