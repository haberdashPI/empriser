import {map_noise} from './util'

export default function generate_terrain(state){
  let height = state.settings.getIn(["terrain","height"])
  let width = state.settings.getIn(["terrain","width"])
  let smoothness = state.settings.getIn(["terrain","smoothness"])
  let seed = state.settings.getIn(["terrain","seed"])

  let terrain = map_noise(width,height,smoothness,seed)

  return {...state, data: {...state.data, terrain: terrain}}
}
