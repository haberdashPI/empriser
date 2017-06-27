import React from 'react'
import {connect} from 'react-redux'

import TextField from 'material-ui/TextField'
import Slider from 'material-ui/Slider'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import RefreshIcon from 'material-ui/svg-icons/action/cached'

import {TERRAIN_UPDATE} from '../actions'
import {randomStr,checkNumber} from '../util'

class TerrainDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {terrain: this.props.terrain}
  }

  componentWillMount(){
    this.setState({terrain: this.props.terrain})
  }

  setTerrain(key,value){
    this.setState({terrain: this.state.terrain.set(key,value)})
  }
  terrain(key){
    return this.state.terrain.get(key)
  }

  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}> 
          <h3 style={{margin: 0}}>Terrain</h3>
          <TextField floatingLabelText={"smoothness"}
                     value={this.terrain("smoothness")}
                     onChange={(e,v) => this.setTerrain('smoothness',v)}
                     errorText={checkNumber("smoothness",
                                                 this.terrain("smoothness"),
                                                 false,0,1)}/>
          <Slider value={this.terrain("smoothness")}
                  sliderStyle={{margin: "0.2em"}}
                  onChange={(e,v) => this.setTerrain('smoothness',v)}/>
          <TextField floatingLabelText={"Seed"}
                     value={this.terrain("seed")}
                     onChange={(e,v) => this.setTerrain("seed",v)}/>
          <IconButton onClick={() => this.setTerrain("seed",randomStr())}>
            <RefreshIcon/>
          </IconButton>
          <br/>

          <TextField floatingLabelText={"width"}
                     value={this.terrain("width")}
                     style={{width: "5em"}}          
                     onChange={(e,v) => this.setTerrain("width",v)}
                     errorText={checkNumber("width",
                                                 this.terrain("width"))}/>
          <span style={{padding: "0.5em"}}>x</span>
          <TextField floatingLabelText={"height"}
                     value={this.terrain("height")}
                     style={{width: "5em"}}
                     onChange={(e,v) => this.setTerrain("height",v)}
                     errorText={checkNumber("height",
                                                 this.terrain("height"))}/>

          <RaisedButton style={{position: "absolute", bottom: "1em", right: "1em"}}
                        primary={true}
                        onClick={() =>
                          this.props.onTerrainUpdate(this.state.terrain)}>
            Render
          </RaisedButton>
          
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {terrain: state.map.settings.get('terrain')}
},dispatch => {
  return {
    onTerrainUpdate: (terrain) => {
      dispatch({type: TERRAIN_UPDATE, value: terrain})
    }
  }
})(TerrainDialog)
