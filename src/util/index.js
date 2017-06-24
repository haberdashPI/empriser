export function randomStr(N=5){
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2)
}
