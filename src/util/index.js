export function randomStr(N=5){
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2)
}

export function hexX(a,b){
  return a + 0.5*Math.abs(b % 2)
}
export function hexY(a,b){
  return b * Math.sqrt(3/4)
}

export function hex_neighbors(a,b){
  return [[a,b-1],[a+1,b-1],[a-1,b],[a+1,b],[a,b+1],[a+1,b+1]]
}

export function checkNumber(name,str,isint=true,
            min=Number.NEGATIVE_INFINITY,
            max=Number.POSITIVE_INFINITY){
  if(!isNaN(str)){
    if(str < min || str > max)
      return name+" must be > "+min+" and < "+max+"."
    else if(isint && str % 1 !== 0)
      return name+" must be an integer"
    else
      return ""
  }
  else
    return name+" must be a number"
}
