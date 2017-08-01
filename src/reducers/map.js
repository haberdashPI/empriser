import {fromJS, Map, List} from 'immutable'
import {TERRAIN_UPDATE, TERRAIN_ZONE_UPDATE, CLIMATE_UPDATE,
        COLORBY_UPDATE, CLIMATE_ZONE_UPDATE, ZOOM, READY_MOVE,
        MOVE, LOAD_MAP, VIEW_UPDATE, NAVIGATE_UPDATE} from '../actions'
import {randomStr,clamp,DEFAULT_COLORBY} from '../util'

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
    colorby: DEFAULT_COLORBY,
    view: {scale: 1, x: 0, y: 0, modern_navigation: true}
  }),
  view: {width: Infinity, height: Infinity},
  data: {},
}

function resolve_settings(state,settingsfn=undefined,chain=generate_chain){
  if(settingsfn !== undefined)
    state = {...state, settings: settingsfn(state.settings)}

  if(chain.isEmpty()) return state
  else return resolve_settings(chain.first()(state),undefined,chain.shift())
}

function wrap(x,min,max){
  if(min === max === 0) return 0;
  let bounded = (x - min) % (max - min)
  if(bounded < 0) bounded += (max - min)
  return bounded + min
}

function constrain_view(state,settings){
  let width = settings.getIn(['terrain','width'])
  let height = settings.getIn(['terrain','height'])*Math.sqrt(3/4)
  let maxZoom = Math.max(width,height)
  let middle_to_edge = state.view.height/map_scale(state)/2.0
  let maxY = Math.max(0,height/2 - middle_to_edge)
  let minY = Math.min(0,-height/2 + middle_to_edge)

  return settings.updateIn(['view','x'],x => wrap(x,-width/2.0,width/2.0)).
                  updateIn(['view','y'],y => clamp(y,minY,maxY)).
                  updateIn(['view','scale'],s => clamp(s,1,maxZoom))
}

export function map_scale(state,window){
  return view_ratio(state,state.settings,window)*state.settings.getIn(['view','scale'])
}

function view_ratio(state,settings,window){
  let v_width
  let v_height
  if(window === undefined){
    v_width = state.view.width
    v_height = state.view.height
  }else{
    v_width = window.innerWidth
    v_height = window.innerHeight
  }

  let width = settings.getIn(['terrain','width'])
  let height = settings.getIn(['terrain','height'])
  let max_view_dim = Math.max(v_width,v_height)
  let max_map_dim = Math.max(width,height*Math.sqrt(3/4));

  return max_view_dim / max_map_dim
}

export default function map(state = resolve_settings(initial_state), action){
  let scale
  switch(action.type){
    case VIEW_UPDATE:
      return {
        ...state,
        view: {width: action.width, height: action.height}
      }
    case NAVIGATE_UPDATE:
      return {
        ...state,
        settings: state.settings.setIn(['view','modern_navigation'],action.value)
      }
    case TERRAIN_UPDATE:
      return resolve_settings(state,s => {
        return constrain_view(state,s.set('terrain',action.value).
                                      set('colorby',action.colorby))
      })
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
      // TODO: calcualte actual amount of scaling, and then move
      // based on that, so we don't scroll when we reach the zoom limit
      let before = state.settings
      let after = constrain_view(state,state.settings.
                                             updateIn(['view','scale'],
                                                      s => s * action.value))
      scale = before.getIn(['view','scale']) / after.getIn(['view','scale'])
      let x_offset = -(action.point[0] - state.view.width/2.0)*
        (1-scale)/map_scale(state,window)
      let y_offset = -(action.point[1] - state.view.height/2.0)*
        (1-scale)/map_scale(state,window)

      return {
        ...state,
        settings: constrain_view(state,after.updateIn(['view','x'],x => x + x_offset).
                                             updateIn(['view','y'],y => y + y_offset))
      }
    case MOVE:
      scale = state.settings.getIn(['view','scale'])
      let settings =
        constrain_view(state,
                       state.settings.
                             updateIn(['view','x'],x => x + action.x / scale /
                               view_ratio(state,state.settings)).
                             updateIn(['view','y'],y => y + action.y / scale /
                               view_ratio(state,state.settings)))

      return {...state, settings: settings}
    case LOAD_MAP:
      return resolve_settings({settings: fromJS(action.value)})
    default:
      return state;
  }
}
