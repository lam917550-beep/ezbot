import { mountGame } from './gameView.js';
const meta={code:'football',name:'Bóng Đá Ảo',icon:'⚽',risk:'Tùy',description:'Dự đoán Home, Away hoặc Draw.',preview:'Trận ảo server.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'home', 'label': 'Home'}, {'value': 'away', 'label': 'Away'}, {'value': 'draw', 'label': 'Draw'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
