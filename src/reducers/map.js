import {Map} from 'immutable'
import {SMOOTHNESS, SEED} from '../actions'
import {randomStr} from '../util'

export default function map(state = Map({smoothness: 0.5, seed: randomStr()}), action){
  switch(action.type){
    case SMOOTHNESS:
      return state.set('smoothness',action.value)
    case SEED:
      return state.set('seed',action.value)
    default:
      return state
  }
}
