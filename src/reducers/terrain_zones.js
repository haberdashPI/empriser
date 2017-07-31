import {map_noise, flattenHist, cumsum} from './util'

export default function generate_terrain_zones(state){
  let depths = new Float64Array(state.data.terrain.length)
  let types = new Int8Array(state.data.terrain.length)

  let borders = cumsum(state.settings.getIn(['terrain_zones','percent']).toJS())
  let flattened = flattenHist(state.data.terrain)

  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let type_depths = state.settings.getIn(['terrain_zones','depth']).toJS()

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      let val = Math.min(1,Math.max(0.001,flattened[yi*width+xi]))
      let typei=1
      while(val > borders[typei] + 0.001) typei++;
      types[yi*width+xi] = typei-1
      let scale = ((val - borders[typei-1])/
        (borders[typei] - borders[typei-1]))
      depths[yi*width+xi] = (scale-0.5) * type_depths[typei-1]
    }
  }

  return {
    ...state,
    data: {
      ...state.data,
      terrain_zones: {depths, types}
    }
  }
}
