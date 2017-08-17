import {List, fromJS} from 'immutable'

import {ON_LOAD,TERRAIN_UPDATE,TERRAIN_ZONE_UPDATE, CLIMATE_UPDATE,
        CLIMATE_ZONE_UPDATE, LOAD_MAP, MAP_COMMAND,
        MAP_UPDATE_END, RIVER_UPDATE} from '../actions'

import generate_terrain from './terrain'
import generate_terrain_zones from './terrain_zones'
import generate_moisture from './moisture'
import generate_temperature from './temperature'
import generate_climate from './climate'
import generate_rivers from './rivers'

const generate_chain = List([
  generate_terrain,
  generate_terrain_zones,
  generate_moisture,
  generate_temperature,
  generate_climate,
  generate_rivers
])

function resolve_settings(state,settingsfn=undefined,chain=generate_chain){
  if(settingsfn !== undefined)
    state = {...state, settings: settingsfn(state.settings)}

  if(chain.isEmpty()) return state
  else return resolve_settings(chain.first()(state),undefined,chain.shift())
}

function handle_update(settings,action){
  let state = {settings}
  switch(action.type){
    case ON_LOAD:
      return {
        ...resolve_settings(state),
        view: {width: action.width, height: action.height}
      }
    case TERRAIN_UPDATE:
      return resolve_settings(state,s => {
        return state,s.set('terrain',fromJS(action.value)).
                       set('colorby',action.colorby)
      })
    case TERRAIN_ZONE_UPDATE:
      return resolve_settings(state,s => {
        return s.set('terrain_zones',fromJS(action.value)).
                 set('colorby',action.colorby)
      })
    case CLIMATE_UPDATE:
      return resolve_settings(state,s => s.set('temp',fromJS(action.temp)).
                                           set('moist',fromJS(action.moist)).
                                           set('colorby',action.colorby))
    case CLIMATE_ZONE_UPDATE:
      return resolve_settings(state,s => {
        return s.set('climate_zones',fromJS(action.value)).
                 set('colorby',action.colorby)
      })
    case RIVER_UPDATE:
      return resolve_settings(state,s => {
        return s.set('rivers',fromJS(action.value)).
                 set('colorby',action.colorby)
      })
    case LOAD_MAP:
      return resolve_settings({settings: fromJS(action.value)})
    default:
      return state
  }
}

onmessage = event => {
  if(event.data.type == MAP_COMMAND){
    let result = handle_update(fromJS(event.data.settings),event.data.action)
    self.postMessage({
      type: MAP_UPDATE_END,
      data: result.data,
      settings: result.settings.toJS()
    })
  }
}
