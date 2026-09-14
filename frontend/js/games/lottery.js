import { mountGame } from './gameView.js';
const meta={code:'lottery',name:'Lottery',icon:'🎟️',risk:'Cao',description:'Chọn 3 chữ số và so với bộ số server.',preview:'Exact / Same.',controls:[{'type': 'text', 'name': 'pick', 'label': 'Bộ số', 'value': '123', 'maxLength': 3}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
