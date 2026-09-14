import { mountGame } from './gameView.js';
const meta={code:'sicbo',name:'Tài Xỉu',icon:'🎲',risk:'Tùy',description:'Ba xúc xắc 1–6, tổng 4–10 là Xỉu và 11–17 là Tài.',preview:'3 xúc xắc.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'dai', 'label': 'Tài'}, {'value': 'xiu', 'label': 'Xỉu'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
