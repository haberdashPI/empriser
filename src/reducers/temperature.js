import {map_noise, flattenHist} from './util'

const height_temp_factor = 0.075

export default function generate_temperature(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let noise_level = state.settings.getIn(['temp','noise'])
  let noises = map_noise(
    state.settings.getIn(['terrain','width']),
    state.settings.getIn(['terrain','height']),
    state.settings.getIn(['temp','smoothness']),
    state.settings.getIn(['temp','seed'])
  )

  let terrain_zones = state.data.terrain_zones
  let max_zone = state.settings.getIn(['terrain_zones','depth']).count()-1
  let max_dist = (max_zone-1)*height_temp_factor*height + 1.3*height/2
  let type_depths = state.settings.getIn(['terrain_zones','depth']).toJS()
  let strength = state.settings.getIn(['temp','strength'])

  let temps = new Array(width*height)

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      let noise = noises[yi*width+xi]

      let zone_type = terrain_zones.types[yi*width+xi]
      let zone_step = Math.max(0,zone_type-1)
      let zone_dist = zone_step*(height_temp_factor*height) +
                      terrain_zones.depths[yi*width+xi]*0.1*height
      let equator_dist = Math.abs(yi-height/2)

      let moist = state.data.moist[yi*width+xi]

      let warmness = 1-(zone_dist+1.3*equator_dist)/max_dist
      let moderator = (1-moist*0.5)
      warmness = (warmness - 0.5)*strength*moderator + 0.5
      
      temps[yi*width+xi] = warmness*(1-noise_level) + noise_level*noise
    }
  }

  return {
    ...state,
    data: {
      ...state.data,
      temp: temps
    }
  }
}
