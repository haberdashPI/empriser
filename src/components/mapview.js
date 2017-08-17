import {Map, is} from 'immutable'
import $ from 'jquery'
import * as PIXI from 'pixi.js'
import _ from 'underscore'
import convert from 'color-convert'

import {MOVE, ZOOM, VIEW_UPDATE, LOADING, EMPTY, ON_LOAD} from '../actions'
import map_update from '../actions/map_update'

import {ARID,  SEMIARID,  TROPICAL,  WARM_TEMPERATE,
        COLD_TEMPERATE,  SUBARCTIC,  ARCTIC,  GRASSES,
        FORREST,  JUNGLE,  EVERGREEN,  BUSH,
        WETLAND, CLIMATE_BITS, TERRAIN_BITS} from '../reducers/climate'

import {map_scale} from '../reducers/map'

import {hexX, hexY} from '../util'

const zoneColor_H = [235/360,  97/360,   61/360,   0/360]
const zoneColor_S = [0.67, 0.50, 0.41, 0.00]

const TERRAIN = 0;
const TERRAIN_ZONE = 1;
const MOISTURE = 2;
const TEMPERATURE = 3;
const CLIMATE_ZONE = 4;

const moist_colors = [ 0x543005, 0x8c510a, 0xbf812d, 0xdfc27d, 0xf6e8c3,
                       0xf5f5f5, 0xc7eae5, 0x80cdc1, 0x35978f, 0x01665e,
                       0x003c30 ]

const temp_colors = [ 0x67001f, 0xb2182b, 0xd6604d, 0xf4a582, 0xfddbc7,
                      0xf7f7f7, 0xd1e5f0, 0x92c5de, 0x4393c3, 0x2166ac,
                      0x053061 ]

const terrainZ_names = ["Ocean","Land","Hills","Mountains"]
const terrainZ_colors = [ 0x386cb0, 0x7fc97f, 0xfdc086, 0xbeaed4 ]

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
    this.cache = []
    this.legend = null
    this.renderer = new PIXI.WebGLRenderer(256,256)
    this.stage = new PIXI.Container()

    view.appendChild(this.renderer.view)

    /* this.renderer.backgroundColor = 0xFFFFFF*/

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
      map_update(this.store.dispatch,this.store.getState().map,{
        type: ON_LOAD,
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

    if(this.settings && this.settings.getIn(['view','modern_navigation'])){
      this.renderer.view.style.cursor = "default"
      return
    }

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

  setup_view(data,index){
    let image = new PIXI.Sprite(data)
    image.filters = [this.filters[index]]
    this.cache[index] = image
  }

  draw_map_scale(mile_width,map_width,view_scale){
    let scale = new PIXI.Container()
    let width = window.innerWidth
    let height = window.innerHeight

    let hexs = Math.max(1,Math.floor(0.25*width / view_scale))
    let pixels = hexs*view_scale
    let miles = Math.round(hexs*mile_width/map_width * 10)/10
    let unit = Math.min(width,height)*0.025;

    let style = new PIXI.TextStyle({fontFamily: 'Helvetica', fontSize: 18})
    let label = hexs > 1 ?
                new PIXI.Text(hexs + " Hexs = "+miles+" mi") :
                new PIXI.Text(hexs + " Hex = "+miles+" mi")

    let bar = new PIXI.Graphics()

    bar.beginFill(0xFFFFFF);
    bar.lineStyle(3,0x000000,1);
    let inWidth = Math.max(pixels,label.width)
    bar.drawRect(width - 4*unit - inWidth,height - 3*unit - label.height,
                 3*unit + inWidth,2*unit + label.height)

    bar.lineStyle(2,0x000000,1);
    bar.moveTo(width - (inWidth/2 + pixels/2) - 2.5*unit,height - 2.25*unit)
    bar.lineTo(width - (inWidth/2 - pixels/2) - 2.5*unit,height - 2.25*unit)

    bar.moveTo(width - (inWidth/2 + pixels/2) - 2.5*unit,height - 2.75*unit)
    bar.lineTo(width - (inWidth/2 + pixels/2) - 2.5*unit,height - 1.75*unit)

    bar.moveTo(width - (inWidth/2 - pixels/2) - 2.5*unit,height - 2.75*unit)
    bar.lineTo(width - (inWidth/2 - pixels/2) - 2.5*unit,height - 1.75*unit)

    scale.addChild(bar)

    label.x = width - (inWidth/2 + label.width/2) - 2.5*unit
    label.y = height - 2.5*unit - label.height
    scale.addChild(label)

    return scale
  }

  draw_key(names,colors){
    let key = new PIXI.Container()

    let width = window.innerWidth
    let height = window.innerHeight
    let unit = Math.min(width,height)*0.025;

    let bar = new PIXI.Graphics()

    let style = new PIXI.TextStyle({fontFamily: 'Helvetica', fontSize: 18})
    let names_t = _.map(names,str => new PIXI.Text(str,style))
    let names_width = _.reduce(names_t,(x,y) => x + y.width,0)

    bar.beginFill(0xFFFFFF);
    bar.lineStyle(2,0x000000,1);
    bar.drawRect(width - unit*colors.length - 3*unit -
                 names_width - 1.5*unit*names.length,
                 height - unit - 3*unit,
                 2*unit*colors.length + names_width +
                 unit*names.length + 0.5*unit,3*unit)

    let cur_width = 0
    for(let i=0;i<names.length;i++){
      bar.beginFill(colors[i])
      bar.lineStyle(2,0x000000,1);
      bar.drawRect(width - unit*(colors.length-i) - 2*unit -
                   names_width + cur_width - 1.5*unit*names.length,
                   height - unit - 2*unit,unit,unit)
      names_t[i].x = width - unit*(colors.length-i) - 0.5*unit -
                     names_width + cur_width - 1.5*unit*names.length
      names_t[i].y = height - unit - 2*unit
      cur_width += names_t[i].width + 2*unit
    }
    key.addChild(bar)

    for(let i=0;i<names.length;i++)
      key.addChild(names_t[i])

    return key
  }

  draw_scale(start,stop,colors){
    let scale = new PIXI.Container()

    let width = window.innerWidth
    let height = window.innerHeight
    let unit = Math.min(width,height)*0.025;

    let bar = new PIXI.Graphics()

    let style = new PIXI.TextStyle({fontFamily: 'Helvetica', fontSize: 18})
    let start_t = new PIXI.Text(start,style)
    let stop_t = new PIXI.Text(stop,style)

    bar.beginFill(0xFFFFFF);
    bar.lineStyle(2,0x000000,1);
    bar.drawRect(width - unit*(colors.length) - 3.5*unit -
                 start_t.width - stop_t.width,
                 height - unit - 3*unit,
                 unit*(colors.length+3) +
                 start_t.width + stop_t.width,3*unit)


    for(let i=0;i<colors.length;i++){
      bar.beginFill(colors[i])
      bar.lineStyle(2,0x000000,1);
      bar.drawRect(width - unit*(colors.length-i) - 2*unit - stop_t.width,
                   height - unit - 2*unit,unit,unit)
    }

    start_t.x = width - unit*(colors.length) - 2.5*unit -
                start_t.width - stop_t.width
    start_t.y = height - unit - 2*unit
    stop_t.x = width - stop_t.width - 1.5*unit
    stop_t.y = height - unit - 2*unit

    scale.addChild(bar)
    scale.addChild(start_t)
    scale.addChild(stop_t)

    return scale
  }

  use_view(index){
    if(this.image) this.stage.removeChild(this.image)
    this.image = this.cache[index]
    this.stage.addChild(this.image)

    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])
    this.update_view_params()

    if(!this.settings.getIn(['view','draw_legends'])){
      if(this.legend) this.stage.removeChild(this.legend)
      return
    }

    if(index == TERRAIN){
      if(this.legend) this.stage.removeChild(this.legend)
      let colors = _.map(_.range(10),i =>
        parseInt("0x"+convert.rgb.hex([255*i/9,255*i/9,255*i/9])))
      this.legend = this.draw_scale("Low","High",colors)
      this.stage.addChild(this.legend)
    }else if(index == MOISTURE){
      if(this.legend) this.stage.removeChild(this.legend)
      this.legend = this.draw_scale("Dry","Wet",moist_colors)
      this.stage.addChild(this.legend)
    }else if(index == TEMPERATURE){
      if(this.legend) this.stage.removeChild(this.legend)
      this.legend = this.draw_scale("Cold","Hot",temp_colors)
      this.stage.addChild(this.legend)
    }else if(index == TERRAIN_ZONE){
      if(this.legend) this.stage.removeChild(this.legend)
      this.legend = this.draw_key(terrainZ_names,terrainZ_colors)
      this.stage.addChild(this.legend)
    }else if(index == CLIMATE_ZONE){
      if(this.legend) this.stage.removeChild(this.legend)
      this.legend = this.draw_map_scale(
        this.settings.getIn(['terrain','mile_width']),
        this.settings.getIn(['terrain','width']),
        map_scale(this.store.getState().map,window)
      )
      this.stage.addChild(this.legend)
    }else{
      if(this.legend) this.stage.removeChild(this.legend)
    }
  }

  update_view_params(){
    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])

    this.image.filters[0].uniforms.view_scale =
      map_scale(this.store.getState().map,window)
    this.image.filters[0].uniforms.view_dims =
      [window.innerWidth,window.innerHeight]
    this.image.filters[0].uniforms.view_position = [
      this.settings.getIn(['view','x']),
      this.settings.getIn(['view','y'])
    ]
    this.image.filters[0].uniforms.map_dims = [width,height]
  }

  update(){
    // update settings and data
    if(is(this.settings,this.store.getState().map.settings) &&
       this.old_width === window.innerWidth &&
       this.old_height === window.innerHeight &&
       this.store.getState().map.data !== LOADING &&
       this.data !== LOADING) return;
    let old_settings = this.settings
    this.settings = this.store.getState().map.settings
    let new_data = this.data == LOADING
    this.data = this.store.getState().map.data

    if(this.data == LOADING || this.data == EMPTY){
      let style = new PIXI.TextStyle({
        fontFamily: 'Helvetica', fontSize: 32
      })
      if(this.loading) this.stage.removeChild(this.loading)
      this.loading = new PIXI.Container()

      if(this.store.getState().map.progress > 3){
        let frame = Math.floor(this.store.getState().map.progress/2) % 8

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0xFFFFFF,0.65);
        graphics.drawRect(0,0,window.innerWidth,window.innerHeight)

        let margin = 0.0025
        let size = 0.04
        let curFrame = 0;
        let frameNum = [2,1,0,3,5,6,7,4]
        for(let ly=0;ly<3;ly++){
          for(let lx=0;lx<3;lx++){
            if(lx === 1 && ly === 1) continue
            if(frameNum[frame] === curFrame++)
              graphics.beginFill(0x4444aa,0.65);
            else
              graphics.beginFill(0x222222,0.65);
            graphics.drawRect(
              window.innerWidth*(0.5 - (size*(2-lx) + margin)),
              window.innerHeight*0.5 - window.innerWidth*(size*ly - size*1.5),
              window.innerWidth*(size-margin*2),
              window.innerWidth*(size-margin*2))
          }
        }
        this.loading.addChild(graphics)
      }

      this.stage.addChild(this.loading)
    }else{
      if(this.loading) this.stage.removeChild(this.loading)

      // update map view
      let height = this.settings.getIn(["terrain","height"])
      let width = this.settings.getIn(["terrain","width"])

      let is_changed_to = (kind) => {
        return !(old_settings && !new_data &&
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
        if(!this.cache[kind_to_index[kind]]) this.update_view(kind)
        this.use_view(kind_to_index[kind])
      }else{
        for(let k of ['terrain','terrain_zones','moist','temp','climate_zones']){
          if(is_changed_to(k)){
            this.cache[kind_to_index[k]] = undefined
            this.update_view(k)
          }
        }
        let kind = this.settings.get('colorby')
        let cache = this.cache[kind_to_index[kind]]
        if(!cache) this.update_view(kind)
        this.use_view(kind_to_index[kind])
      }

      this.update_view_params()
    }

    this.old_width = window.innerWidth
    this.old_height = window.innerHeight

    this.renderer.render(this.stage)
  }

  update_view(kind){
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
      this.setup_view(terrain,TERRAIN)
      /* this.use_view(TERRAIN)*/
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
      this.setup_view(terrain_zones,TERRAIN_ZONE)
      /* this.use_view(TERRAIN_ZONE)*/
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
      this.setup_view(moist,MOISTURE)
      /* this.use_view(MOISTURE)*/
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
      this.setup_view(temp,TEMPERATURE)
      /* this.use_view(TEMPERATURE)*/
    }else if(kind === 'climate_zones'){
      let climate_zones = asTexture(width,height,(data,real_width) => {
        for(let yi=0;yi<height;yi++){
          for(let xi=0;xi<width;xi++){
            data[4*(yi*real_width + xi) + 0] =
              (this.data.climate_zones.climate[yi*width+xi] + 1)*CLIMATE_BITS +
              (this.data.terrain_zones.types[yi*width+xi] + 1)*TERRAIN_BITS
            // + (this.data.climate_zones.vegetation[yi*width+xi] + 1)*VEG_BITS
            data[4*(yi*real_width + xi) + 1] =
              Math.floor(255*this.data.terrain_zones.depths[yi*width+xi])
            data[4*(yi*real_width + xi) + 2] = this.data.rivers[yi*width+xi]
            data[4*(yi*real_width + xi) + 3] = 255
          }
        }
      })
      this.setup_view(climate_zones,CLIMATE_ZONE)
      /* this.use_view(CLIMATE_ZONE)*/
    }
  }
}
