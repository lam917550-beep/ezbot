import { mountGame } from './gameView.js';
const meta={code:'plinko',name:'Plinko',icon:'⚪',risk:'Tùy',description:'Bóng rơi qua các hàng pin và vào ô hệ số.',preview:'Bảng Plinko.',controls:[{'type': 'select', 'name': 'risk', 'label': 'Rủi ro', 'options': [{'value': 'low', 'label': 'Thấp'}, {'value': 'medium', 'label': 'Trung bình'}, {'value': 'high', 'label': 'Cao'}]}, {'type': 'number', 'name': 'rows', 'label': 'Số hàng', 'min': 8, 'max': 12, 'value': 10}]};
export function createGame(host,ctx){ return mountGame(host,meta,ctx); }
export default createGame;

createGame.meta = meta;
