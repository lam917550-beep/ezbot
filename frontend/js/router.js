export function route(){return location.hash.replace(/^#/,'')||'home'} export function go(r){location.hash=r}
