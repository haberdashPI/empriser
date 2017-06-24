import {Map} from 'immutable'
import {TERRAIN_UPDATE} from '../actions'
import {randomStr} from '../util'

const initial_state = Map({
  smoothness: 0.5,
  seed: randomStr(),
  width: 100,
  height: 60,
  zones: [0.5, 0.55, 0.6, 0.62, 0.85, 0.9],
  colorby: "terrain"
})

export default function map(state = initial_state, action){
  switch(action.type){
    case TERRAIN_UPDATE:
      return action.value
    default:
      return state;
  }
}
