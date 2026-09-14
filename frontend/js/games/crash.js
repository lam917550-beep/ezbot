import { mountGame } from './gameView.js';
const meta={code:'crash',name:'Crash',icon:'🚀',risk:'Cao',description:'Chọn mức cashout; server tạo điểm crash thực.',preview:'Đường bay tăng dần.',controls:[{'type': 'number', 'name': 'target', 'label': 'Cashout', 'step': 0.01, 'min': 1.01, 'max': 100, 'value': 2}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
