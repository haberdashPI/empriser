import {Map, is} from 'immutable'
import paper, {Point, Rectangle, Path, Color, Layer} from 'paper'
import $ from 'jquery'

import {hexX, hexY} from '../util'

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

    if(!old_settings || !is(this.settings.get('terrain'),
                            old_settings.get('terrain'))){
      setTimeout(() => {
        $('#spinner-view').addClass('spinner')
        this.drawMap()
        $('#spinner-view').removeClass('spinner')
      }, 0);
    }
  }

  drawMap(){
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
        
        let level = this.data.terrain[yi*width+xi]
        this.tiles[yi*width+xi].fillColor = new Color(level,level,level)
        this.tiles[yi*width+xi].strokeWidth = 0
      }
    }
  }
}
