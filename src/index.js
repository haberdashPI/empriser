import React from 'react'
import ReactDOM from 'react-dom'
import paper, {Point, Rectangle, Path, Color} from 'paper'
import $ from 'jquery'
import SimplexNoise from 'simplex-noise'
import MersenneTwister from 'mersenne-twister'

import './index.less'

function hexX(a,b){
  return a + 0.5*Math.abs(b % 2)
}
function hexY(a,b){
  return b * Math.sqrt(3/4)
}

function terrain(wrap,scale,depth,H,seed){
  let noises = new Array(depth)
  
  let rng = new MersenneTwister(1983)
  for(let i=0;i<depth;i++)
    noises[i] = new SimplexNoise(() => rng.random())

  return (x,y) => {
    let total = 0;
    let amp = 0.5;
    let norm = 0.5
    let level = 1;

    // map coordinates to cylinder so that
    // the map wraps around along the x axis
    let cZ = y
    let r = wrap / (2*Math.PI)
    let cX = r * Math.cos(2*Math.PI * x / wrap)
    let cY = r * Math.sin(2*Math.PI * x / wrap)

    for(let i=0;i<depth;i++){
      total += amp*noises[i].noise3D(level*cX/scale,
                                     level*cY/scale,
                                     level*cZ/scale)
      amp *= H
      level *= 2
      norm += amp
    }
    return total / norm
  }
}

class MapView{
  constructor(canvas){
    let height = this.height = 60
    let width = this.width = 100
    this.canvas = canvas    
    this.data = new Array(height*height)
    this.scale = 10
    this.center = new Point(0,0)
    this.gen = terrain(width,width/2,10,0.60,1983)

    let maxd = Math.max(hexX(width/2,height/2),hexY(width/2,height/2))
    for(let yi=0;yi<height;yi++){
      for(let xi=0;xi<width;xi++){
        let value = this.gen(xi,yi)*0.5 + 0.5

        let x = hexX(xi-width/2,yi-height/2) * this.scale
        let y = hexY(xi-width/2,yi-height/2) * this.scale
        this.data[yi*height+xi] =
          new Path.RegularPolygon(new Point(x,y),6,
                                  (this.scale / (2*Math.sqrt(3/4))) + 0.5)
        this.data[yi*height+xi].fillColor = new Color(value,value,value)
        this.data[yi*height+xi].strokeWidth = 0
      }
    }
  }
}

$(document).ready(() => {
  let canvas = document.getElementById('view')
  canvas.width = $(window).width()
  canvas.height = $(window).height()
  paper.setup(canvas);
  paper.view.translate(canvas.width/2,canvas.height/2)
  let map = new MapView(canvas);

  $(window).resize(() => {
    paper.view.viewSize.width = $(window).width();
    paper.view.viewSize.height = $(window).height();
    paper.view.center = new Point(0,0)
  })
})

/*ReactDOM.render(<Toolbar/>, document.getElementById('root'))*/
