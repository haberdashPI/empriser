import {Map, is} from 'immutable'
import paper, {Point, Rectangle, Path, Color, Layer} from 'paper'
import $ from 'jquery'

import {hexX, hexY} from '../util'

const zoneColor_H = [235,  97,   61,   0]
const zoneColor_S = [0.67, 0.50, 0.41, 0.00]

const most_moist = new Color(10/255,0,204/255)
const least_moist = new Color(255/255,205/255,112/255)

const most_temp = new Color(168/255,0,0)
const least_temp = new Color(14/255,0,143/255)

function interpColor(a,b,x){
 return a.add(b.subtract(a).multiply(x))
}

export default class MapView{
  constructor(canvas,store){
    this.store = store
    this.map = Map({})
    
    $(document).ready(() => {
      canvas.width = $(window).width()
      canvas.height = $(window).height()
      paper.setup(canvas);
      paper.view.translate(canvas.width/2,canvas.height/2)
      this.layer = new Layer()

      $(window).resize(() => {
        paper.view.viewSize.width = $(window).width();
        paper.view.viewSize.height = $(window).height();
        paper.view.center = new Point(0,0)
      })
      this.update()
    })

    store.subscribe(() => this.update())
  }

  update(){
    if(is(this.settings,this.store.getState().map.settings)) return;
    let old_settings = this.settings
    this.settings = this.store.getState().map.settings
    this.data = this.store.getState().map.data

    setTimeout(() => {
      $('#spinner-view').addClass('spinner')
      this.placeTiles()
      this.colorTiles()
      $('#spinner-view').removeClass('spinner')
    }, 0);
  }

  placeTiles(){
    // for now, just remove all elements from data
    this.layer.clear()
    this.layer.activate()

    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])

    this.tiles = Array(width*height)    
    
    this.scale = 10

    for(let yi=0;yi<height;yi++){
      for(let xi=0;xi<width;xi++){
        let x = hexX(xi-width/2,yi-height/2) * this.scale
        let y = hexY(xi-width/2,yi-height/2) * this.scale

        this.tiles[yi*width+xi] = 
          new Path.RegularPolygon(new Point(x,y),6,
                                  (this.scale / (2*Math.sqrt(3/4))) + 0.5)
        this.tiles[yi*width+xi].strokeWidth = 0
      }
    }
  }

  colorTiles(){
    let height = this.settings.getIn(["terrain","height"])
    let width = this.settings.getIn(["terrain","width"])
    for(let yi=0;yi<height;yi++){
      for(let xi=0;xi<width;xi++){
        let color = new Color()
        
        if(this.settings.get('colorby') == 'terrain'){
          let level = this.data.terrain[yi*width+xi]
          color = new Color(level,level,level)
          
        }else if(this.settings.get('colorby') == 'temp'){
          let level = this.data.temp[yi*width+xi]
          color = interpColor(least_temp,most_temp,level)
          
        }else if(this.settings.get('colorby') == 'moist'){
          let level = this.data.moist[yi*width+xi]
          color = interpColor(least_moist,most_moist,level)
                    
        }else if(this.settings.get('colorby') == 'zones'){
          let depth = this.data.zones.depths[yi*width+xi]
          let zone = this.data.zones.types[yi*width+xi]
          let breadth = this.settings.getIn(['zones','depth',zone])

          color.brightness = depth*0.6 + 0.8
          color.hue = zoneColor_H[zone]
          color.saturation = zoneColor_S[zone]
        }

        this.tiles[yi*width+xi].fillColor = color        
      }
    }
  }
}
