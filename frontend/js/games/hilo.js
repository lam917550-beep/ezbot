import { mountGame } from './gameView.js';
const meta={code:'hilo',name:'Hi-Lo',icon:'🎴',risk:'Tùy',description:'Đoán lá tiếp theo cao hơn hoặc thấp hơn.',preview:'2 lá.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'higher', 'label': 'Higher'}, {'value': 'lower', 'label': 'Lower'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
