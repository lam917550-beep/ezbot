import { mountGame } from './gameView.js';
const meta={code:'dice',name:'Dice',icon:'🎲',risk:'Tùy',description:'Đoán cao/thấp trên xúc xắc 0–99.',preview:'Xúc xắc server.',controls:[{'type': 'buttons', 'name': 'direction', 'label': 'Hướng', 'options': [{'value': 'over', 'label': 'Cao hơn'}, {'value': 'under', 'label': 'Thấp hơn'}]}, {'type': 'number', 'name': 'target', 'label': 'Mốc', 'min': 1, 'max': 98, 'value': 50}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
