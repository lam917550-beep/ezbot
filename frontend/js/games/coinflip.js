import { mountGame } from './gameView.js';
const meta={code:'coinflip',name:'Coin Flip',icon:'🪙',risk:'Thấp',description:'Chọn mặt ngửa hoặc sấp.',preview:'50/50 server.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'heads', 'label': 'Heads'}, {'value': 'tails', 'label': 'Tails'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
