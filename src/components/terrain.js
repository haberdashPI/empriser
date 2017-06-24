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
import {randomStr} from '../util'

class TerrainDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {map: this.props.map}
  }

  componentWillMount(){
    this.setState({map: this.props.map})
  }

  updateValue(key,value){
    this.setState({map: this.state.map.set(key,value)})
  }

  checkNumber(name,str,isint=true,min=Number.NEGATIVE_INFINITY,max=Number.POSITIVE_INFINITY){
    if(!isNaN(str)){
      if(str < min || str > max)
        return name+" must be a number from "+min+" to "+max+"."
      else if(isint && str % 1 !== 0)
        return name+" must be a whole number"
      else
        return ""
    }
    else
      return name+" must be a number"
  }

  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <TextField floatingLabelText={"smoothness"}
                     value={this.state.map.get("smoothness")}
                     onChange={(e,v) => this.updateValue('smoothness',v)}
                     errorText={this.checkNumber("smoothness",
                                                 this.state.map.get("smoothness"),
                                                 false,0,1)}/>
          <Slider value={this.state.map.get("smoothness")} sliderStyle={{margin: "0.2em"}}
                  onChange={(e,v) => this.updateValue('smoothness',v)}/>
          <TextField floatingLabelText={"Seed"}
                     value={this.state.map.get("seed")}
                     onChange={(e,v) => this.updateValue("seed",v)}/>
          <IconButton onClick={() => this.updateValue("seed",randomStr())}>
            <RefreshIcon/>
          </IconButton>
          <br/>

          <TextField floatingLabelText={"width"}
                     value={this.state.map.get("width")}
                     style={{width: "5em"}}          
                     onChange={(e,v) => this.updateValue("width",v)}
                     errorText={this.checkNumber("width",
                                                 this.state.map.get("width"))}/>
          <span style={{padding: "0.5em"}}>x</span>
          <TextField floatingLabelText={"height"}
                     value={this.state.map.get("height")}
                     style={{width: "5em"}}
                     onChange={(e,v) => this.updateValue("height",v)}
                     errorText={this.checkNumber("height",
                                                 this.state.map.get("height"))}/>

          <RaisedButton style={{position: "absolute", bottom: "1em", right: "1em"}}
                        primary={true}
                        onClick={() =>
                          this.props.onTerrainUpdate(this.state.map)}>
            Render
          </RaisedButton>
          
        </div>
      </Paper>
    )
  }
}

export default connect(state => {return state},dispatch => {
  return {
    onTerrainUpdate: (terrain) => {
      dispatch({type: TERRAIN_UPDATE, value: terrain})
    }
  }
})(TerrainDialog)
