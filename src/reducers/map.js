import {fromJS, Map} from 'immutable'
import {TERRAIN_UPDATE, ZONE_UPDATE, MOIST_TEMP_UPDATE} from '../actions'
import {randomStr, hexX, hexY} from '../util'
import _ from 'underscore'

import sha1 from 'sha-1'
import SimplexNoise from 'simplex-noise'
import MersenneTwister from 'mersenne-twister'

const initial_state = {
  settings: fromJS({
    terrain: {
      smoothness: 0.5,
      seed: randomStr(),
      width: 100,
      height: 60
    },
    zones: {
      depth: [0.3, 0.3, 0.4, 0.6],
      percent: [0.5, 0.35, 0.1, 0.05]
    },
    moist: {strength: 0.3, noise: 0.2, smoothness: 0.8, seed: randomStr()},
    temp: {strength: 0.3, noise: 0.2, smoothness: 0.8, seed: randomStr()},
    colorby: "zones"
  }),

  data: {},
}

function resolve_settings(state){
  let terrain = {
    settings: state.settings,
    data: {
      terrain: generate_terrain(state.settings.get('terrain'))
    }
  }
  return {
    ...terrain,
    data: {
      ...terrain.data,
      zones: generate_zones(terrain,state.settings.get('zones'))
    }
  }
}

export default function map(state = resolve_settings(initial_state), action){
  switch(action.type){
    case TERRAIN_UPDATE:
      return resolve_settings({
        settings: state.settings.set('terrain',action.value)})
    case ZONE_UPDATE:
      return resolve_settings({
        settings: state.settings.set('zones',action.value)})
    case MOIST_TEMP_UPDATE:
      return resolve_settings({
        settings: state.settings.
                        set('temp',action.value.temp).
                        set('mosit',action.value.moist).
                        set('colorby',action.value.colorby)
      })
    default:
      return state;
  }
}

function generate_terrain(settings){
  let height = settings.get("height")
  let width = settings.get("width")
  let terrain = new Array(height*width)

  let H = Math.log((1-settings.get("smoothness"))*5+1) / Math.log(6)
  let seed = parseInt(sha1(settings.get("seed")).slice(8))
  let wrap = width
  let scale = width/2
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

      terrain[yi*width+xi] = (total/norm)*0.5 + 0.5
    }
  }

  return terrain
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

function generate_zones(state,zones){
  let depths = new Array(state.data.terrain.length)
  let types = new Array(state.data.terrain.length)

  let borders = cumsum(zones.get('percent').toJS())
  let flattened = flattenHist(state.data.terrain)

  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])

  for(let yi=0;yi<height;yi++){
    for(let xi=0;xi<width;xi++){
      let val = Math.min(1,Math.max(0.001,flattened[yi*width+xi]))
      let typei=1
      while(val > borders[typei] + 0.001) typei++;
      types[yi*width+xi] = typei-1
      depths[yi*width+xi] = ((val - borders[typei-1])/
        (borders[typei] - borders[typei-1])) * zones.getIn(['depth',typei-1])
    }
  }

  return {depths, types}
}
