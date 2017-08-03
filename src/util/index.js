import _ from 'underscore'

export function randomStr(N=5){
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2)
}

export function hexX(a,b){
  return a + 0.5*Math.abs(b % 2)
}
export function hexY(a,b){
  return b * Math.sqrt(3/4)
}

function wraphexs(bounds){
  return coords => {
    let wrapped = coords[0] % bounds[0]
    wrapped = wrapped < 0 ? wrapped + bounds[0] : wrapped
    return [wrapped,coords[1]]
  }
}

export function hex_neighbors(a,b,bounds=[-Infinity,Infinity]){
  if(Math.abs(b % 2) === 0)
    return _.map([[a,b-1],[a+1,b-1],[a-1,b],[a+1,b],[a,b+1],[a+1,b+1]],
                 wraphexs(bounds))
  else{
    return _.map([[a-1,b-1],[a,b-1],[a-1,b],[a+1,b],[a,b+1],[a+1,b+1]],
                 wraphexs(bounds))
  }
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

export function clamp(x,min=-Infinity,max=Infinity){
  return Math.max(min,Math.min(max,x))
}

export const DEFAULT_COLORBY = "climate_zones"
