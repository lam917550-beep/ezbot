import { mountGame } from './gameView.js';
const meta={code:'keno',name:'Keno',icon:'🎱',risk:'Tùy',description:'Chọn tối đa 10 số từ 1 đến 80.',preview:'20 số được rút.',controls:[{'type': 'text', 'name': 'picks', 'label': 'Số đã chọn', 'value': '1,7,12,23,35', 'maxLength': 64}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
