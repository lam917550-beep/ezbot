import { mountGame } from './gameView.js';
const meta={code:'horse',name:'Đua Ngựa',icon:'🐎',risk:'Tùy',description:'Chọn một trong 8 ngựa; thời gian race do server tạo.',preview:'8 ngựa.',controls:[{'type': 'number', 'name': 'horse', 'label': 'Ngựa', 'min': 1, 'max': 8, 'value': 1}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
