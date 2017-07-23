import {fromJS, Map, List} from 'immutable'
import {TERRAIN_UPDATE, TERRAIN_ZONE_UPDATE, CLIMATE_UPDATE,
        COLORBY_UPDATE, CLIMATE_ZONE_UPDATE, ZOOM, READY_MOVE,
        MOVE, LOAD_MAP} from '../actions'
import {randomStr, hexX, hexY, hex_neighbors} from '../util'
import _ from 'underscore'

import sha1 from 'sha-1'
import SimplexNoise from 'simplex-noise'
import MersenneTwister from 'mersenne-twister'

export const ARID = 0
export const SEMIARID = 1
export const TROPICAL = 2
export const WARM_TEMPERATE = 3
export const COLD_TEMPERATE = 4
export const SUBARCTIC = 5
export const ARCTIC = 6

export const GRASSES = 0
export const FORREST = 1
export const JUNGLE = 2
export const EVERGREEN = 3
export const BUSH = 4
export const WETLAND = 5

const initial_state = {
  settings: fromJS({
    terrain: {
      smoothness: 0.5,
      seed: randomStr(),
      width: 100,
      height: 60
    },
    terrain_zones: {
      depth: [0.3, 0.3, 0.4, 0.6],
      percent: [0.5, 0.35, 0.1, 0.05]
    },
    moist: {strength: 0.5, noise: 0.45, smoothness: 0.6, seed: randomStr()},
    temp: {strength: 0.95, noise: 0.45, smoothness: 0.6, seed: randomStr()},
    climate_zones: {
      percent: [0.05,0.05,0.2,0.3,0.3,0.05,0.05],
      vegetation: {
        forrest: {density: 0.6, smoothness: 0.3, seed: randomStr()},
        evergreen: {density: 0.6, smoothness: 0.3, seed: randomStr()},
        jungle: {density: 0.6, smoothness: 0.3, seed: randomStr()},
        bush: {density: 0.1, smoothness: 0.1, seed: randomStr()},
        wetland: {density: 0.1, smoothness: 0.4, seed: randomStr()}
      }
    },
    colorby: "climate_zones",
    view: {scale: 10, x: 0, y: 0, draggable: false}
  }),

  data: {},
}

const generate_chain = List([
  generate_terrain,
  generate_terrain_zones,
  generate_moisture,
  generate_temperature,
  generate_climate
])

function resolve_settings(state,settingsfn=undefined,chain=generate_chain){
  if(settingsfn !== undefined)
    state = {...state, settings: settingsfn(state.settings)}

  if(chain.isEmpty()) return state
  else return resolve_settings(chain.first()(state),undefined,chain.shift())
}

export default function map(state = resolve_settings(initial_state), action){
  switch(action.type){
    case TERRAIN_UPDATE:
      return resolve_settings(state,s => s.set('terrain',action.value).
                                           set('colorby',action.colorby))
    case TERRAIN_ZONE_UPDATE:
      return resolve_settings(state,s => s.set('terrain_zones',action.value).
                                           set('colorby',action.colorby))
    case CLIMATE_UPDATE:
      return resolve_settings(state,s => s.set('temp',action.value.temp).
                                           set('moist',action.value.moist).
                                           set('colorby',action.value.colorby))
    case CLIMATE_ZONE_UPDATE:
      return resolve_settings(state,s => s.set('climate_zones',action.value).
                                           set('colorby',action.colorby))
    case COLORBY_UPDATE:
      return resolve_settings(state,s => s.set('colorby',action.value))
    case ZOOM:
      return {
        ...state,
        settings: state.settings.updateIn(['view','scale'],
                                          s => s * action.value)
      }
    case READY_MOVE:
      return {
        ...state,
        settings: state.settings.setIn(['view','draggable'],action.value)
      }
    case MOVE:
      let scale = state.settings.getIn(['view','scale'])
      return {
        ...state,
        settings: state.settings.
                        updateIn(['view','x'],x => x + action.x / scale).
                        updateIn(['view','y'],y => y + action.y / scale)
      }
    case LOAD_MAP:
      return resolve_settings({settings: fromJS(action.value)})
    default:
      return state;
  }
}

function map_noise(width,height,smoothness,seed_start){
  let result = new Array(height*width)

  let H = Math.log((1-smoothness)*5+1) / Math.log(6)
  let seed = parseInt(sha1(seed_start).slice(8))
  let wrap = width
  let scale = 0.2*width
  let depth = 10

  let noises = new Array(depth)
  let rng = new MersenneTwister(seed)

  for(let i=0;i<depth;i++) noises[i] = new SimplexNoise(() => rng.random())

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      let x = hexX(xi-width/2,yi-height/2)
      let y = hexY(xi-width/2,yi-height/2)

      let total = 0;
      let amp = 0.5;
      let norm = 0.5
      let level = 1;

      // map coordinates to cylinder so that
      // the map wraps around along the x axis
      let cZ = y
      let r = wrap / (2*Math.PI)
      let cX = r * Math.cos(2*Math.PI * x / wrap)
      let cY = r * Math.sin(2*Math.PI * x / wrap)

      for(let i=0;i<depth;i++){
        total += amp*noises[i].noise3D(level*cX/scale,
                                       level*cY/scale,
                                       level*cZ/scale)
        amp *= H
        level *= 2
        norm += amp
      }

      result[yi*width+xi] = (total/norm)*0.5 + 0.5
    }
  }

  return result
}

function generate_terrain(state){
  let height = state.settings.getIn(["terrain","height"])
  let width = state.settings.getIn(["terrain","width"])
  let smoothness = state.settings.getIn(["terrain","smoothness"])
  let seed = state.settings.getIn(["terrain","seed"])

  let terrain = map_noise(width,height,smoothness,seed)

  return {...state, data: {...state.data, terrain: terrain}}
}

function cumsum(xs){
  let ys = new Array(xs.length+1)
  ys[0] = 0
  for(let i=0;i<xs.length;i++){
    ys[i+1] = xs[i] + ys[i]
  }
  return ys
}

function flattenHist(xs,N=1000){
  // histogram
  let bins = new Array(N)
  let min = _.reduce(xs,(x,y) => x < y ? x : y)
  let max = _.reduce(xs,(x,y) => x > y ? x : y)
  for(let i=0;i<N;i++) bins[i] = 0
  for(let i=0;i<xs.length;i++)
    bins[Math.round((N-1)*((xs[i]-min)/(max-min)))] += 1

  // flatten origianl values
  let ys = new Array(xs.length)
  let cumbins = cumsum(bins)
  for(let i=0;i<xs.length;i++){
    let rbin = (N-1)*((xs[i]-min)/(max-min))
    let sbin = Math.floor(rbin)
    let ebin = Math.ceil(rbin)
    let start = cumbins[sbin+1]/cumbins[cumbins.length-1]
    let end = cumbins[ebin+1]/cumbins[cumbins.length-1]

    ys[i] = sbin === ebin ? start :
            start + (start-end) * (rbin-ebin)/(sbin-ebin)
            
  }
  return ys
}

function generate_terrain_zones(state){
  let depths = new Array(state.data.terrain.length)
  let types = new Array(state.data.terrain.length)

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

function find_water_distance(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let water_dists = new Array(state.data.terrain.length)
  // searches for distances up to 10% of map or 10 squares whichever is greater
  let num_passes = 6 //Math.max(10,Math.ceil(0.1*Math.max(height,width)))

  let terrain_zones = state.data.terrain_zones

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      water_dists[yi*width+xi] =
        terrain_zones.types[yi*width+xi] == 0 ? 0 : Infinity
    }
  }

  let type_depths = state.settings.getIn(['terrain_zones','depth']).toJS()
  let old_water_dists = new Array(width*height)
  for(let i=0;i<water_dists.length;i++)
    old_water_dists[i] = water_dists[i]

  let max_dist = 0
  for(let pass=0;pass<num_passes;pass++){
    for(let yi=0;yi<height;yi++){
      for(let xi=0;xi<width;xi++){
        let dists = Array(6)
        let ndist = 0
        let neighbors = hex_neighbors(xi,yi)

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
          let ws = Array(ndist)
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

function generate_moisture(state){
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
  let moists = new Array(state.data.terrain.length)
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

const height_temp_factor = 0.075

function generate_temperature(state){
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

Set.prototype.difference = function(setB) {
  var difference = new Set(this);
  for (var elem of setB) {
    difference.delete(elem);
  }
  return difference;
}


function generate_climate(state){
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
