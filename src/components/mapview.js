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
    this.store.dispatch({
      type: ZOOM,
      value: Math.pow(2,-ZOOM_SCALE*event.deltaY),
      point: this.lastPos || [window.innerWidth/2,window.innerHeight/2]
    })
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
      return this.settings.get('colorby') === kind &&
             !(old_settings &&
               is(this.settings.get('colorby'),old_settings.get('colorby')) &&
               is(this.settings.get(kind),old_settings.get(kind)) &&
               is(this.settings.get('terrain','width'),
                  old_settings.get('terrain','width')) &&
               is(this.settings.get('terrain','height'),
                  old_settings.get('terrain','height')) &&
               this.old_width === window.innerWidth &&
               this.old_height === window.innerHeight)
    }

    let use_filter = (data,filter_index) => {
      if(this.image) this.stage.removeChild(this.image)
      this.image = new PIXI.Sprite(data)
      this.stage.addChild(this.image)
      this.image.filters = [this.filters[filter_index]]
    }

    if(is_changed_to('terrain')){
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

      use_filter(terrain,TERRAIN)
    }else if(is_changed_to('terrain_zones')){
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

      use_filter(terrain_zones,TERRAIN_ZONE)
    }if(is_changed_to('moist')){
      let terrain = asTexture(width,height,(data,real_width) => {
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

      use_filter(terrain,MOISTURE)
    }if(is_changed_to('temp')){
      let terrain = asTexture(width,height,(data,real_width) => {
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

      use_filter(terrain,TEMPERATURE)
    }else if(is_changed_to('climate_zones')){
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

      use_filter(climate_zones,CLIMATE_ZONE)
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
}
