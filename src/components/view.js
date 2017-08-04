import React from 'react'
import {connect} from 'react-redux'

import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Toggle from 'material-ui/Toggle'

import {COLORBY_UPDATE, NAVIGATE_UPDATE, LEGEND_UPDATE, LOADING} from '../actions'

class ViewDialog extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0, marginBottom: "1em"}}>View</h3>
          <RadioButtonGroup name="" valueSelected={this.props.colorby}
                            onChange={(e,v) => this.props.onColorby(v)}>
            <RadioButton value="terrain" label="Terrain"
                         disabled={this.props.load_pending}/>
            <RadioButton value="terrain_zones" label="Terrain Zones"
                         disabled={this.props.load_pending}/>
            <RadioButton value="temp" label="Temperature"
                         disabled={this.props.load_pending}/>
            <RadioButton value="moist" label="Moisture"
                         disabled={this.props.load_pending}/>
            <RadioButton value="climate_zones" label="Climate Zones"
                         disabled={this.props.load_pending}/>
          </RadioButtonGroup>
          <Toggle
            style={{paddingTop: "1em"}}
            label={this.props.modern_navigation ?
                   "Scroll to Move, Pinch/Ctrl-Scroll to Zoom" :
                   "Drag to Move, Scroll to Zoom"}
            disabled={this.props.load_pending}
            toggled={this.props.modern_navigation}
            onToggle={(event,value) => this.props.onModernNavigate(value)}/>
          <Toggle
            style={{paddingTop: "1em"}}
            label={this.props.draw_legends ? "Draw Legends" : "Hide Legends"}
            disabled={this.props.load_pending}
            toggled={this.props.draw_legends}
            onToggle={(event,value) => this.props.onDrawLegends(value)}/>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {
    colorby: state.map.settings.get('colorby'),
    modern_navigation: state.map.settings.getIn(['view','modern_navigation']),
    draw_legends: state.map.settings.getIn(['view','draw_legends']),
    load_pending: state.map.data == LOADING
  }
},dispatch => {
  return {
    onColorby: (str) => {
      dispatch({
        type: COLORBY_UPDATE,
        value: str
      })
    },
    onModernNavigate: (value) => {
      dispatch({
        type: NAVIGATE_UPDATE,
        value: value
      })
    },
    onDrawLegends: (value) => {
      dispatch({
        type: LEGEND_UPDATE,
        value: value
      })
    }
  }
})(ViewDialog)
