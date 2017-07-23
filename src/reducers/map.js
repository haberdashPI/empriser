import {fromJS, Map, List} from 'immutable'
import {TERRAIN_UPDATE, TERRAIN_ZONE_UPDATE, CLIMATE_UPDATE,
        COLORBY_UPDATE, CLIMATE_ZONE_UPDATE, ZOOM, READY_MOVE,
        MOVE, LOAD_MAP} from '../actions'
import {randomStr} from '../util'

import generate_terrain from './terrain'
import generate_terrain_zones from './terrain_zones'
import generate_moisture from './moisture'
import generate_temperature from './temperature'
import generate_climate from './climate'

const generate_chain = List([
  generate_terrain,
  generate_terrain_zones,
  generate_moisture,
  generate_temperature,
  generate_climate
])

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
