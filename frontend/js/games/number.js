import { mountGame } from './gameView.js';
const meta={code:'number',name:'Đoán Số',icon:'🔢',risk:'Cao',description:'Đoán một chữ số 0–9.',preview:'1/10 odds.',controls:[{'type': 'number', 'name': 'guess', 'label': 'Số', 'min': 0, 'max': 9, 'value': 0}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
