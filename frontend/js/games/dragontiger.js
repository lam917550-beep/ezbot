import { mountGame } from './gameView.js';
const meta={code:'dragontiger',name:'Dragon Tiger',icon:'🐉',risk:'Thấp',description:'Một lá cho Dragon và một lá cho Tiger.',preview:'So rank.',controls:[{'type': 'buttons', 'name': 'choice', 'label': 'Chọn', 'options': [{'value': 'dragon', 'label': 'Dragon'}, {'value': 'tiger', 'label': 'Tiger'}, {'value': 'tie', 'label': 'Tie'}]}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
