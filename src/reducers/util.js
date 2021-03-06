import sha1 from 'sha-1'
import SimplexNoise from 'simplex-noise'
import MersenneTwister from 'mersenne-twister'
import {hexX,hexY} from '../util'

import _ from 'underscore'

export function map_noise(width,height,smoothness,seed_start){
  let result = new Float64Array(height*width)

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

export function cumsum(xs){
  let ys = new Float64Array(xs.length+1)
  ys[0] = 0
  for(let i=0;i<xs.length;i++){
    ys[i+1] = xs[i] + ys[i]
  }
  return ys
}

export function flattenHist(xs,N=1000){
  // histogram
  let bins = new Float64Array(N)
  let min = _.reduce(xs,(x,y) => x < y ? x : y)
  let max = _.reduce(xs,(x,y) => x > y ? x : y)
  for(let i=0;i<N;i++) bins[i] = 0
  for(let i=0;i<xs.length;i++)
    bins[Math.round((N-1)*((xs[i]-min)/(max-min)))] += 1

  // flatten origianl values
  let ys = new Float64Array(xs.length)
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
