import { mountGame } from './gameView.js';
const meta={code:'bottle',name:'Bottle',icon:'🍾',risk:'Tùy',description:'Vòng chai với 8–12 vị trí.',preview:'Bottle wheel.',controls:[{'type': 'number', 'name': 'seats', 'label': 'Số vị trí', 'min': 8, 'max': 12, 'value': 10}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
