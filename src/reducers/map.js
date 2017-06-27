import {fromJS, Map} from 'immutable'
import {TERRAIN_UPDATE} from '../actions'
import {randomStr, hexX, hexY} from '../util'

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
      depth: [0.1, 0.1, 0.3, 0.5],
      percent: [0.5, 0.2, 0.1, 0.2]
    },
    colorby: "terrain"
  }),

  data: {},
}

function resolve_settings(state){
  return {
    settings: state.settings,
    data: {
      terrain: generate_terrain(state.settings.get('terrain'))
    }
  }
}

export default function map(state = resolve_settings(initial_state), action){
  switch(action.type){
    case TERRAIN_UPDATE:
      return {
        settings: state.settings.set('terrain',action.value),
        data: {...state.data, terrain: generate_terrain(action.value)}
      }
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
