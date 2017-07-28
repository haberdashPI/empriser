import {map_noise,flattenHist} from './util'
import _ from 'underscore'

export const CLIMATE_BITS = 1

export const ARID = 0
export const SEMIARID = 1
export const TROPICAL = 2
export const WARM_TEMPERATE = 3
export const COLD_TEMPERATE = 4
export const SUBARCTIC = 5
export const ARCTIC = 6

export const VEG_BITS = 8

export const GRASSES = 0
export const FORREST = 1
export const JUNGLE = 2
export const EVERGREEN = 3
export const BUSH = 4
export const WETLAND = 5

Set.prototype.difference = function(setB) {
  var difference = new Set(this);
  for (var elem of setB) {
    difference.delete(elem);
  }
  return difference;
}

export default function generate_climate(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])

  let climate = new Array(width*height)
  let vegetation = new Array(width*height)
  let veg = {
    arid: state.settings.getIn(['climate_zones','percent',0]),
    semiarid: state.settings.getIn(['climate_zones','percent',1]),
    tropical: state.settings.getIn(['climate_zones','percent',2]),
    wtemp: state.settings.getIn(['climate_zones','percent',3]),
    ctemp: state.settings.getIn(['climate_zones','percent',4]),
    subarctic: state.settings.getIn(['climate_zones','percent',5]),
    arctic: state.settings.getIn(['climate_zones','percent',6])
  }

  let unused = new Set(_.filter(_.range(width*height),i => {
    return state.data.terrain_zones.types[i] > 0
  }))
  let total_land = unused.size

  let aridness = _.map([...unused],i => {
    if(state.data.terrain_zones.types[i] < 3)
      return (1-state.data.moist[i])*(
        1/(1+Math.exp(-4*(state.data.temp[i]-0.8))))
    else
      return 0
  })
  aridness = flattenHist(aridness)

  let ii = 0;
  let new_used = new Set()
  for(let i of unused){
    let _arid = aridness[ii++]
    if(_arid > 1-veg.arid){
      new_used.add(i)
      climate[i] = ARID
    }else if(_arid > 1-(veg.arid+veg.semiarid)){
      new_used.add(i)
      climate[i] = SEMIARID
    }
  }
  unused = unused.difference(new_used)

  let tropicness = _.map([...unused],i => {
    let m = state.data.moist[i]
    let t = state.data.temp[i]
    return m*(1/(1+Math.exp(-4*(t-0.8))))
  })
  tropicness = flattenHist(tropicness)

  let norm = unused.size/total_land
  new_used = new Set()
  ii = 0
  for(let i of unused){
    if(tropicness[ii++] > 1-(veg.tropical / norm)){
      climate[i] = TROPICAL
      new_used.add(i)
    }
  }
  unused = unused.difference(new_used)

  let temp_flat = flattenHist(_.map([...unused],i => state.data.temp[i]))

  norm = unused.size/total_land
  ii = 0;
  for(let i of unused){
    let temp = temp_flat[ii++]
    if(temp > 1-veg.wtemp / norm){
      climate[i] = WARM_TEMPERATE
    }else if(temp > 1-((veg.wtemp + veg.ctemp) / norm)){
      climate[i] = COLD_TEMPERATE
    }else if(temp > 1-((veg.wtemp + veg.ctmp + veg.subarctic) / norm)){
      climate[i] = SUBARCTIC
    }else{
      climate[i] = ARCTIC
    }
  }

  let thresh_veg = (name,climates,value) => {
    let fnoise = map_noise(
      width,height,
      state.settings.getIn(['climate_zones','vegetation',name,'smoothness']),
      state.settings.getIn(['climate_zones','vegetation',name,'seed'])
    )
    let flat = flattenHist(fnoise)
    let fthresh = 1-state.settings.getIn(['climate_zones','vegetation',name,'density'])

    for(let i=0;i<width*height;i++){
      if(flat[i] > fthresh && _.some(climates,x => x === climate[i]))
        vegetation[i] = value
    }
  }

  for(let i=0;i<vegetation.length;i++) vegetation[i] = GRASSES

  thresh_veg('forrest',[WARM_TEMPERATE],FORREST)
  thresh_veg('evergreen',[COLD_TEMPERATE],EVERGREEN)
  thresh_veg('jungle',[TROPICAL],JUNGLE)
  thresh_veg('bush',[SEMIARID,WARM_TEMPERATE],BUSH)
  thresh_veg('wetland',[TROPICAL,WARM_TEMPERATE,COLD_TEMPERATE],EVERGREEN)

  return {
    ...state,
    data: {
      ...state.data,
      climate_zones: {
        climate: climate,
        vegetation: vegetation
      }
    }
  }
}
