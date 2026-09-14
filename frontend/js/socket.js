export function connectSocket(){try{const s=io();s.on('connect',()=>{});return s}catch{return null}}
