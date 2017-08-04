import {fromJS, Map, List} from 'immutable'
import {TERRAIN_UPDATE, TERRAIN_ZONE_UPDATE, CLIMATE_UPDATE,
        COLORBY_UPDATE, CLIMATE_ZONE_UPDATE, ZOOM, READY_MOVE,
        MOVE, LOAD_MAP, VIEW_UPDATE, NAVIGATE_UPDATE,
        LEGEND_UPDATE, LOADING, EMPTY, MAP_UPDATE_BEGIN, MAP_UPDATE_END,
        MAP_UPDATE_PROGRESS} from '../actions'
import {randomStr,clamp,DEFAULT_COLORBY} from '../util'

const initial_state = {
  settings: fromJS({
    terrain: {
      smoothness: 0.5,
      seed: randomStr(),
      width: 100,
      height: 60,
      mile_width: 8000,
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
    view: {
      scale: 1,
      x: 0, y: 0,
      modern_navigation: true,
      draw_legends: true
    }
  }),
  view: {width: Infinity, height: Infinity},
  data: EMPTY
}

function wrap(x,min,max){
  if(min === max === 0) return 0;
  let bounded = (x - min) % (max - min)
  if(bounded < 0) bounded += (max - min)
  return bounded + min
}

function constrain_view(state,settings = state.settings){
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
  return (view_ratio(state,state.settings,window)*
    state.settings.getIn(['view','scale']))
}

function view_ratio(state,settings){
  let v_width
  let v_height
  if(state.view !== undefined){
    v_width = state.view.width
    v_height = state.view.height
  }else{
    v_width = window.innerWidth
    v_height = window.innerHeight
  }

  let width = settings.getIn(['terrain','width'])
  let height = settings.getIn(['terrain','height'])*Math.sqrt(3/4)

  return Math.min(v_width / width,v_height / height)
}

export default function map(state = initial_state, action){
  let scale
  switch(action.type){
    case MAP_UPDATE_BEGIN:
      return {
        ...state,
        data: LOADING,
        progress: 0
      }
    case MAP_UPDATE_PROGRESS:
      return {
        ...state,
        data: LOADING,
        progress: action.value
      }
    case MAP_UPDATE_END:
      let result = {
        settings: fromJS(action.settings),
        data: action.data,
        view: {width: window.innerWidth, height: window.innerHeight}
      }
      result.settings = constrain_view(result)
      return result
    case VIEW_UPDATE:
      return {
        ...state,
        view: {width: action.width, height: action.height}
      }
    case NAVIGATE_UPDATE:
      return {
        ...state,
        settings: state.settings.setIn(['view','modern_navigation'],
                                       action.value)
      }
    case LEGEND_UPDATE:
      return {
        ...state,
        settings: state.settings.setIn(['view','draw_legends'],
                                       action.value)
      }
    case COLORBY_UPDATE:
      return {
        ...state,
        settings: state.settings.set('colorby',action.value)
      }
    case ZOOM:
      // TODO: calcualte actual amount of scaling, and then move
      // based on that, so we don't scroll when we reach the zoom limit
      let before = state.settings
      let after = constrain_view(state,state.settings.
                                             updateIn(['view','scale'],
                                                      s => s * action.value))
      scale = before.getIn(['view','scale']) / after.getIn(['view','scale'])
      let x_offset = -(action.point[0] - window.innerWidth/2.0)*
      (1-scale)/map_scale(state,window)
      let y_offset = -(action.point[1] - window.innerHeight/2.0)*
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
    default:
      return state;
  }
}
