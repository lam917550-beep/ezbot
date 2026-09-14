import { mountGame } from './gameView.js';
const meta={code:'rocket',name:'Rocket',icon:'🚀',risk:'Cao',description:'Chọn điểm cashout; rocket có crash point server.',preview:'Rocket climb.',controls:[{'type': 'number', 'name': 'target', 'label': 'Cashout', 'step': 0.01, 'min': 1.01, 'max': 100, 'value': 2}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
