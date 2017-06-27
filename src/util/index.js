export function randomStr(N=5){
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2)
}

export function hexX(a,b){
  return a + 0.5*Math.abs(b % 2)
}
export function hexY(a,b){
  return b * Math.sqrt(3/4)
}

