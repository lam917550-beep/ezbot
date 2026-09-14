import { mountGame } from './gameView.js';
const meta={code:'limbo',name:'Limbo',icon:'📈',risk:'Cao',description:'Đặt hệ số mục tiêu và chờ kết quả.',preview:'Multipler realtime.',controls:[{'type': 'number', 'name': 'target', 'label': 'Mục tiêu', 'step': 0.01, 'min': 1.01, 'max': 1000, 'value': 2}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
