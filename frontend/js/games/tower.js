import { mountGame } from './gameView.js';
const meta={code:'tower',name:'Tower',icon:'🗼',risk:'Cao',description:'Chọn đường đi qua 9 tầng, mỗi tầng có 3 vị trí.',preview:'9 tầng.',controls:[{'type': 'text', 'name': 'picks', 'label': 'Đường đi', 'value': '0,1,2,0,1,2,0,1,2', 'maxLength': 64}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
