import { mountGame } from './gameView.js';
const meta={code:'roulette',name:'Roulette',icon:'🎯',risk:'Tùy',description:'Chọn đỏ, đen, chẵn hoặc lẻ.',preview:'Bàn roulette 0–36.',controls:[{'type': 'buttons', 'name': 'betType', 'label': 'Cược', 'options': [{'value': 'red', 'label': 'Đỏ'}, {'value': 'black', 'label': 'Đen'}, {'value': 'even', 'label': 'Chẵn'}, {'value': 'odd', 'label': 'Lẻ'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
