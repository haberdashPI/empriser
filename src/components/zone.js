import React from 'react'
import {connect} from 'react-redux'

import {Tabs, Tab} from 'material-ui/Tabs'
import TextField from 'material-ui/TextField'
import Slider from 'material-ui/Slider'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import {ZONE_UPDATE} from '../actions'
import {checkNumber} from '../util'

class ZoneDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {zones: this.props.zones}
  }
  componentWillMount(){
    this.setState({zones: this.props.zones})
  }

  setZone(keys,value){
    this.setState({zones: this.state.zones.setIn(keys,value)})
  }
  zone(keys){
    return this.state.zones.getIn(keys)
  }

  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0, marginBottom: "1em"}}>Zones</h3>
          <Tabs>
            <Tab label="Ocean">
              <TextField floatingLabelText={"% of map"}
                         value={this.zone(["percent",0])}
                         onChange={(e,v) => this.setZone(['percent',0],v)}
                         errorText={checkNumber("percentage",
                                                this.zone(["percent",0]),
                                                false,0,1)}/>
              <Slider value={this.zone(["percent",0])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['percent',0],v)}/>
              <TextField floatingLabelText={"depth"}
                         value={this.zone(["depth",0])}
                         onChange={(e,v) => this.setZone(['depth',0],v)}
                         errorText={checkNumber("depth",
                                                this.zone(["depth",0]),
                                                false,0,1)}/>
              <Slider value={this.zone(["depth",0])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['depth',0],v)}/>
            </Tab>
            <Tab label="Land">
              <TextField floatingLabelText={"% of map"}
                         value={this.zone(["percent",1])}
                         onChange={(e,v) => this.setZone(['percent',1],v)}
                         errorText={checkNumber("percentage",
                                                this.zone(["percent",1]),
                                                false,0,1)}/>
              <Slider value={this.zone(["percent",1])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['percent',1],v)}/>
              <TextField floatingLabelText={"depth"}
                         value={this.zone(["depth",1])}
                         onChange={(e,v) => this.setZone(['depth',1],v)}
                         errorText={checkNumber("depth",
                                                this.zone(["depth",1]),
                                                false,0,1)}/>
              <Slider value={this.zone(["depth",1])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['depth',1],v)}/>          
            </Tab>
            <Tab label="Hills">
              <TextField floatingLabelText={"% of map"}
                         value={this.zone(["percent",2])}
                         onChange={(e,v) => this.setZone(['percent',2],v)}
                         errorText={checkNumber("percentage",
                                                this.zone(["percent",2]),
                                                false,0,1)}/>
              <Slider value={this.zone(["percent",2])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['percent',2],v)}/>
              <TextField floatingLabelText={"depth"}
                         value={this.zone(["depth",2])}
                         onChange={(e,v) => this.setZone(['depth',2],v)}
                         errorText={checkNumber("depth",
                                                this.zone(["depth",2]),
                                                false,0,1)}/>
              <Slider value={this.zone(["depth",2])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['depth',1],v)}/>          
            </Tab>

            <Tab label="Moutains">
              <TextField floatingLabelText={"% of map"}
                         value={this.zone(["percent",3])}
                         onChange={(e,v) => this.setZone(['percent',3],v)}
                         errorText={checkNumber("percentage",
                                                this.zone(["percent",3]),
                                                false,0,1)}/>
              <Slider value={this.zone(["percent",3])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['percent',3],v)}/>
              <TextField floatingLabelText={"depth"}
                         value={this.zone(["depth",3])}
                         onChange={(e,v) => this.setZone(['depth',3],v)}
                         errorText={checkNumber("depth",
                                                this.zone(["depth",3]),
                                                false,0,1)}/>
              <Slider value={this.zone(["depth",3])}
                      sliderStyle={{margin: "0.2em"}}
                      onChange={(e,v) => this.setZone(['depth',3],v)}/>          
            </Tab>
          </Tabs>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {zones: state.map.settings.get('zones')}
},dispatch => {
  return {
    onZoneUpdate: (zone) => {
      dispatch({type: ZONE_UPDATE, value: zones})
    }
  }
})(ZoneDialog)
