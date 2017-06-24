import React from 'react'
import ReactDOM from 'react-dom'
import paper, {Point} from 'paper'
import $ from 'jquery'

import './index.less'
import MapView from './components/mapview.js'
import MapToolbar from './components/toolbar.js'


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

let toolbar = <MapToolbar/>
ReactDOM.render(toolbar,document.getElementById('ui-view'))
