import {Map, is} from 'immutable'
import $ from 'jquery'
import * as PIXI from 'pixi.js'
import _ from 'underscore'

import {MOVE, ZOOM, VIEW_UPDATE} from '../actions'

import {ARID,  SEMIARID,  TROPICAL,  WARM_TEMPERATE,
        COLD_TEMPERATE,  SUBARCTIC,  ARCTIC,  GRASSES,
        FORREST,  JUNGLE,  EVERGREEN,  BUSH,
        WETLAND, CLIMATE_BITS, VEG_BITS} from '../reducers/climate'

import {map_scale} from '../reducers/map'

import {hexX, hexY} from '../util'

const zoneColor_H = [235/360,  97/360,   61/360,   0/360]
const zoneColor_S = [0.67, 0.50, 0.41, 0.00]

const TERRAIN = 0;
const TERRAIN_ZONE = 1;
const MOISTURE = 2;
const TEMPERATURE = 3;
const CLIMATE_ZONE = 4;

const kind_to_index = {
  'terrain': TERRAIN,
  'terrain_zones': TERRAIN_ZONE,
  'temp': TEMPERATURE,
  'moist': MOISTURE,
  'climate_zones': CLIMATE_ZONE
}

const most_temp = [168/255,0,0]
const least_temp = [14/255,0,143/255]

import terrain_shader from './shaders/terrain.glsl'
import terrain_zone_shader from './shaders/terrain_zone.glsl'
import moisture_shader from './shaders/moisture.glsl'
import temperature_shader from './shaders/temperature.glsl'
import climate_zone_shader from './shaders/climate_zone.glsl'

const LEFT = 1

const ZOOM_SCALE = 1/100

function asTexture(width,height,encoder){
  let canvas=document.createElement("canvas");
  let ctx=canvas.getContext("2d");

  // size the canvas to your desired image
  canvas.width=Math.max(width,window.innerWidth);
  canvas.height=Math.max(height,window.innerHeight);

  // get the imageData and pixel array from the canvas
  let imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  let data=imgData.data;
  encoder(data,canvas.width)
  ctx.putImageData(imgData,0,0);

  return PIXI.Texture.from(canvas)
}

export default class MapView{
  constructor(view,store){
    this.store = store
    this.cache = {}
    this.renderer = new PIXI.WebGLRenderer(256,256)
    this.stage = new PIXI.Container()

    view.appendChild(this.renderer.view)

    /* this.renderer.backgroundColor = rgb2hex([1,1,1])*/

    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth, window.innerHeight);

    this.old_width = window.innerWidth
    this.old_height = window.innerHeight

    this.filters = [
      new PIXI.Filter(null,terrain_shader),
      new PIXI.Filter(null,terrain_zone_shader),
      new PIXI.Filter(null,moisture_shader),
      new PIXI.Filter(null,temperature_shader),
      new PIXI.Filter(null,climate_zone_shader)
    ]

    for(let i in _.range(5)){
      this.filters[i].uniforms.view_scale = 10.0
      this.filters[i].uniforms.view_dims =
        [window.innerWidth,window.innerHeight]
      this.filters[i].uniforms.view_position = [0,0]
      this.filters[i].uniforms.map_dims = [1,1]
    }

    store.subscribe(() => this.update())
    $(window).resize(() => {
      this.renderer.resize(window.innerWidth, window.innerHeight);
      this.store.dispatch({
        type: VIEW_UPDATE,
        width: window.innerWidth,
        height: window.innerHeight
      })
    })

    $(document).ready(() => {
      this.store.dispatch({
        type: VIEW_UPDATE,
        width: window.innerWidth,
        height: window.innerHeight
      })
    })

    this.lastDrag = undefined
    this.lastPos = undefined
    this.renderer.view.addEventListener("mousemove",
                                        event => this.handleMove(event),false);
    this.renderer.view.addEventListener("mousewheel",
                                        event => this.handleZoom(event),false);
  }

  handleMove(event){
    this.lastPos = [event.clientX,event.clientY]

    if(this.settings && this.settings.getIn(['view','modern_navigation']))
      return

    if(!this.settings || !(event.buttons & LEFT)){
      this.renderer.view.style.cursor = "-webkit-grab"
      this.renderer.view.style.cursor = "-moz-grab"
      this.renderer.view.style.cursor = "grab"

      this.lastDrag = undefined
      return
    }

    this.renderer.view.style.cursor = "-webkit-grabbing"
    this.renderer.view.style.cursor = "-moz-grabbing"
    this.renderer.view.style.cursor = "grabbing"

    if(this.lastDrag === undefined)
      this.lastDrag = [event.screenX,event.screenY]
    else{
      let diffX = event.screenX - this.lastDrag[0]
      let diffY = event.screenY - this.lastDrag[1]
      this.lastDrag = [event.screenX,event.screenY]

      this.store.dispatch({
        type: MOVE,
        x: diffX,
        y: diffY,
      })
    }
  }

  handleZoom(event){
    if(!this.settings) return
    event.preventDefault()

    if(this.settings.getIn(['view','modern_navigation'])){
      if(event.ctrlKey){
        this.store.dispatch({
          type: ZOOM,
          value: Math.pow(2,-ZOOM_SCALE*event.deltaY),
          point: this.lastPos || [window.innerWidth/2,window.innerHeight/2]
        })
      }else{
        this.store.dispatch({
          type: MOVE,
          x: -event.deltaX,
          y: -event.deltaY
        })
      }
    }else{
      this.store.dispatch({
        type: ZOOM,
        value: Math.pow(2,-ZOOM_SCALE*event.deltaY),
        point: this.lastPos || [window.innerWidth/2,window.innerHeight/2]
      })
    }
  }

  setup_filter(data,filter_index){
    let image = new PIXI.Sprite(data)
    image.filters = [this.filters[filter_index]]
    return image
  }

  use_filter(filter){
    if(this.image) this.stage.removeChild(this.image)
    this.image = filter
    this.stage.addChild(this.image)
  }

  update(){
    // update settings and data
    if(is(this.settings,this.store.getState().map.settings) &&
       this.old_width === window.innerWidth &&
       this.old_height === window.innerHeight) return;
    let old_settings = this.settings
    this.settings = this.store.getState().map.settings
    this.data = this.store.getState().map.data

    // update map view
    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])

    let is_changed_to = (kind) => {
      return !(old_settings &&
               is(this.settings.get('colorby'),old_settings.get('colorby')) &&
               is(this.settings.get(kind),old_settings.get(kind)) &&
               is(this.settings.get('terrain','width'),
                  old_settings.get('terrain','width')) &&
               is(this.settings.get('terrain','height'),
                  old_settings.get('terrain','height')) &&
               this.old_width === window.innerWidth &&
               this.old_height === window.innerHeight)
    }

    if(!old_settings || this.settings.get('colorby') !== old_settings.get('colorby')){
      let kind = this.settings.get('colorby')
      let cache = this.cache[kind]
      if(cache) this.use_filter(cache,kind_to_index[kind])
      else this.update_filter(kind)
    }else{
      for(let k of ['terrain','terrain_zones','moist','temp','climate_zones']){
        if(is_changed_to(k)){
          this.cache = {}
          this.update_filter(k)
        }
      }
    }

    this.image.filters[0].uniforms.view_scale =
      map_scale(this.store.getState().map,window)
    this.image.filters[0].uniforms.view_dims =
      [window.innerWidth,window.innerHeight]
    this.image.filters[0].uniforms.view_position = [
      this.settings.getIn(['view','x']),
      this.settings.getIn(['view','y'])
    ]
    this.image.filters[0].uniforms.map_dims = [width,height]

    this.old_width = window.innerWidth
    this.old_height = window.innerHeight

    this.renderer.render(this.stage)
  }

  update_filter(kind){
    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])

    if(kind === 'terrain'){
      let terrain = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              Math.floor(255*this.data.terrain[yi*width+xi])
            data[4*(yi*real_width + xi) + 1] = 0
            data[4*(yi*real_width + xi) + 2] = 0
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.cache['terrain'] = this.setup_filter(terrain,TERRAIN)

      this.use_filter(this.cache['terrain'])
    }else if(kind === 'terrain_zones'){
      let terrain_zones = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              this.data.terrain_zones.types[yi*width+xi] + 1
            data[4*(yi*real_width + xi) + 1] =
              Math.floor(255*this.data.terrain_zones.depths[yi*width+xi])
            data[4*(yi*real_width + xi) + 2] = 0
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.cache['terrain_zones'] =
        this.setup_filter(terrain_zones,TERRAIN_ZONE)

      this.use_filter(this.cache['terrain_zones'])
    }if(kind === 'moist'){
      let moist = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              Math.floor(255*this.data.moist[yi*width+xi])
            data[4*(yi*real_width + xi) + 1] = 0
            data[4*(yi*real_width + xi) + 2] = 0
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.cache['moist'] = this.setup_filter(moist,MOISTURE)

      this.use_filter(this.cache['moist'])
    }if(kind === 'temp'){
      let temp = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              Math.floor(255*this.data.temp[yi*width+xi])
            data[4*(yi*real_width + xi) + 1] = 0
            data[4*(yi*real_width + xi) + 2] = 0
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.cache['temp'] = this.setup_filter(temp,TEMPERATURE)

      this.use_filter(this.cache['temp'])
    }else if(kind === 'climate_zones'){
      let climate_zones = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              this.data.terrain_zones.types[yi*width+xi] + 1
            data[4*(yi*real_width + xi) + 1] =
              Math.floor(255*this.data.terrain_zones.depths[yi*width+xi])
            data[4*(yi*real_width + xi) + 2] =
              (this.data.climate_zones.climate[yi*width+xi] + 1)*CLIMATE_BITS +
              (this.data.climate_zones.vegetation[yi*width+xi] + 1)*VEG_BITS
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.cache['climate_zones'] =
        this.setup_filter(climate_zones,CLIMATE_ZONE)

      this.use_filter(this.cache['climate_zones'])
    }
  }
}
