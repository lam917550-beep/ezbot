import { mountGame } from './gameView.js';
const meta={code:'treasure',name:'Treasure',icon:'💎',risk:'Tùy',description:'Chọn tối đa 5 rương trong 25 vị trí.',preview:'25 rương.',controls:[{'type': 'text', 'name': 'picks', 'label': 'Rương chọn', 'value': '0,1,2', 'maxLength': 32}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
