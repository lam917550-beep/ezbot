import { mountGame } from './gameView.js';
const meta={code:'balloon',name:'Balloon',icon:'🎈',risk:'Cao',description:'Thổi bóng tới mức muốn cashout trước khi pop.',preview:'Balloon pop.',controls:[{'type': 'number', 'name': 'stop', 'label': 'Cashout', 'step': 0.01, 'min': 1.01, 'max': 20, 'value': 2}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
