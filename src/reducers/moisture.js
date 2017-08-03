import {map_noise, flattenHist} from './util'
import {hex_neighbors} from '../util'

function find_water_distance(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let water_dists = new Float64Array(state.data.terrain.length)
  // searches for distances up to 10% of map or 10 squares whichever is greater
  let num_passes = Math.max(10,Math.ceil(0.1*Math.max(height,width)))

  let terrain_zones = state.data.terrain_zones

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      water_dists[yi*width+xi] =
        terrain_zones.types[yi*width+xi] == 0 ? 0 : Infinity
    }
  }

  let type_depths = state.settings.getIn(['terrain_zones','depth']).toJS()
  let old_water_dists = new Float64Array(width*height)
  for(let i=0;i<water_dists.length;i++)
    old_water_dists[i] = water_dists[i]

  let max_dist = 0
  for(let pass=0;pass<num_passes;pass++){
    for(let yi=0;yi<height;yi++){
      for(let xi=0;xi<width;xi++){
        let dists = new Float64Array(6)
        let ndist = 0
        let neighbors = hex_neighbors(xi,yi,[width,height])

        for(let n=0;n<6;n++){
          let nxi = neighbors[n][0]
          let nyi = neighbors[n][1]
          if(nxi >= 0 && nxi < width && nyi >= 0 && nyi < height &&
             isFinite(old_water_dists[nyi*width+nxi])){
            let n_level = terrain_zones.types[nyi*width+nxi] +
                          terrain_zones.depths[nyi*width+nxi]
            let cur_level = terrain_zones.types[yi*width+xi] +
                            terrain_zones.depths[yi*width+xi]
            let ydist = n_level - cur_level
            dists[ndist++] = old_water_dists[nyi*width+nxi] +
                             Math.sqrt(ydist*ydist + 1)
          }
        }

        if(ndist > 0){
          let ws = new Float64Array(ndist)
          let wsum = 0
          for(let n=0;n<ndist;n++)
            wsum += ws[n] = Math.exp(-dists[n]/2)
          let softmin = 0
          for(let n=0;n<ndist;n++) softmin += ws[n]*dists[n]
          water_dists[yi*width+xi] = Math.min(old_water_dists[yi*width+xi],
                                              softmin / wsum)
        }else{
          water_dists[yi*width+xi] = old_water_dists[yi*width+xi]
        }


        if(isFinite(water_dists[yi*width+xi]) &&
           water_dists[yi*width+xi] > max_dist)
          max_dist = water_dists[yi*width+xi]
      }
    }

    let temp = old_water_dists
    old_water_dists = water_dists
    water_dists = old_water_dists
  }

  let max_zone = state.settings.getIn(['terrain_zones','depth']).count()
  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      if(!isFinite(water_dists[yi*width+xi]))
        water_dists[yi*width+xi] = 1
      else
        water_dists[yi*width+xi] = water_dists[yi*width+xi] / max_dist
    }
  }

  return water_dists
}

export default function generate_moisture(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let noise_level = state.settings.getIn(['moist','noise'])

  let noises = map_noise(
    state.settings.getIn(['terrain','width']),
    state.settings.getIn(['terrain','height']),
    state.settings.getIn(['moist','smoothness']),
    state.settings.getIn(['moist','seed'])
  )

  let water_dists = find_water_distance(state)
  let moists = new Float64Array(state.data.terrain.length)
  let strength = state.settings.getIn(['moist','strength'])

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      let noise = noises[yi*width+xi]
      let water_dist = water_dists[yi*width+xi]
      let moist = (1-noise_level)*(1-water_dist) + noise*noise_level

      moists[yi*width+xi] = (moist - 0.5)*strength + 0.5
    }
  }

  return {
    ...state,
    data: {
      ...state.data,
      moist: moists
    }
  }
}
