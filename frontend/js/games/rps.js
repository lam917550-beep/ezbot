import { mountGame } from './gameView.js';
const meta={code:'rps',name:'Kéo Búa Bao',icon:'✊',risk:'Thấp',description:'Đấu với máy theo luật kéo-búa-bao.',preview:'RPS.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'rock', 'label': 'Búa'}, {'value': 'paper', 'label': 'Bao'}, {'value': 'scissors', 'label': 'Kéo'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
