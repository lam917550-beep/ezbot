import { mountGame } from './gameView.js';
const meta={code:'baccarat',name:'Baccarat',icon:'👑',risk:'Trung',description:'So điểm Player và Banker theo luật baccarat.',preview:'Player / Banker / Tie.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'player', 'label': 'Player'}, {'value': 'banker', 'label': 'Banker'}, {'value': 'tie', 'label': 'Tie'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
