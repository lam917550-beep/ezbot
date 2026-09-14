import { mountGame } from './gameView.js';
const meta={code:'color',name:'Color',icon:'🌈',risk:'Thấp',description:'Đoán màu đỏ, xanh hoặc tím.',preview:'45/40/15 weight.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'red', 'label': 'Đỏ'}, {'value': 'blue', 'label': 'Xanh'}, {'value': 'purple', 'label': 'Tím'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
