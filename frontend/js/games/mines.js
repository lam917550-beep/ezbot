import { mountGame } from './gameView.js';
const meta={code:'mines',name:'Mines',icon:'💣',risk:'Cao',description:'Chọn số mìn và các ô muốn mở trong một lượt.',preview:'Lưới 5×5.',controls:[{'type': 'select', 'name': 'mines', 'label': 'Số mìn', 'options': [{'value': '3', 'label': '3 mìn'}, {'value': '5', 'label': '5 mìn'}, {'value': '10', 'label': '10 mìn'}]}, {'type': 'text', 'name': 'picks', 'label': 'Ô chọn', 'value': '0,1,2', 'maxLength': 32}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
