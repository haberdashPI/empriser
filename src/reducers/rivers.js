import sha1 from 'sha-1'
import MersenneTwister from 'mersenne-twister'
import {hex_neighbors} from '../util'
import _ from 'underscore'

const min_dense = 1/10000
const max_dense = 1/250

const weight_sigma_max = 10

export default function geenerate_rivers(state){
  let width = state.settings.getIn(['terrain','width'])
  let height = state.settings.getIn(['terrain','height'])
  let relative_density = state.settings.getIn(['rivers','density'])
  let randomness = state.settings.getIn(['rivers','randomness'])
  let seed_start = state.settings.getIn(['rivers','seed'])
  let seed = parseInt(sha1(seed_start).slice(8))
  let rng = new MersenneTwister(seed)

  let min_rivers = min_dense*width*height
  let max_rivers = max_dense*width*height

  let num_rivers = min_rivers + (max_rivers-min_rivers)*relative_density
  let order = _.sortBy(_.range(state.data.terrain.length),
                       i => state.data.terrain[i])
  let rivers = new Int8Array(width*height)
  for(let i=0;i<rivers.length;i++)
    rivers[i] = 0

  for(let i=0;i<num_rivers;i++){
    let map_index = order[order.length-i-1]
    let yi = Math.floor(map_index / width)
    let xi = map_index % width

    while(state.data.terrain_zones.types[yi*width+xi] > 0){
      // get all of the neighbors
      let n = hex_neighbors(xi,yi,[width,height])

      // probabilisty select the most downhill direction
      let weight_total = 0
      let cum_weights = new Float64Array(6)
      for(let j=0;j<6;j++){
        let gradient = state.data.terrain[n[j*2+1]*width+n[j*2+0]] -
                       state.data.terrain[yi*width+xi]
        weight_total += Math.exp(weight_sigma_max * randomness * gradient)
        cum_weights[j] = weight_total
      }

      let selection = weight_total*rng.random()
      let next_tile = 5 // by default we select the last direction
      for(let j=0;j<6;j++){
        if(cum_weights[j] > selection){
          next_tile = j
          break
        }
      }

      // mark the given side of this tile as having a river exit
      rivers[yi*width+xi] += 2**next_tile

      // move to the next tile
      xi = n[next_tile*2+0]
      yi = n[next_tile*2+1]
    }
  }

  return {
    ...state,
    data: {
      ...state.data,
      rivers: rivers
    }
  }
}
