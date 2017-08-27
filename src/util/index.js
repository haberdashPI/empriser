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

export function hex_neighbors(a,b,bounds=[Infinity,Infinity]){
  let t
  let result = new Int32Array(12)
  let wrap = wraphexs(bounds)
  if(Math.abs(b % 2) === 0){
    t = wrap([a,b-1])
    result[0*2] = t[0]
    result[0*2+1] = t[1]

    t = wrap([a+1,b])
    result[1*2] = t[0]
    result[1*2+1] = t[1]

    t = wrap([a,b+1])
    result[2*2] = t[0]
    result[2*2+1] = t[1]

    t = wrap([a-1,b+1])
    result[3*2] = t[0]
    result[3*2+1] = t[1]

    t = wrap([a-1,b])
    result[4*2] = t[0]
    result[4*2+1] = t[1]

    t = wrap([a-1,b-1])
    result[5*2] = t[0]
    result[5*2+1] = t[1]

  }else{
    t = wrap([a+1,b-1])
    result[0*2] = t[0]
    result[0*2+1] = t[1]

    t = wrap([a+1,b])
    result[1*2] = t[0]
    result[1*2+1] = t[1]

    t = wrap([a+1,b+1])
    result[2*2] = t[0]
    result[2*2+1] = t[1]

    t = wrap([a,b+1])
    result[3*2] = t[0]
    result[3*2+1] = t[1]

    t = wrap([a-1,b])
    result[4*2] = t[0]
    result[4*2+1] = t[1]

    t = wrap([a,b-1])
    result[5*2] = t[0]
    result[5*2+1] = t[1]

  }
  return result
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
