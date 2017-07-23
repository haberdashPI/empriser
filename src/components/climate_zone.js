import React from 'react'
import {connect} from 'react-redux'
import _ from 'underscore'

import {Table,TableBody,TableHeader,TableHeaderColumn,
        TableRow,TableRowColumn} from 'material-ui/Table';
import TextField from 'material-ui/TextField'
import Slider from 'material-ui/Slider'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import ViewIcon from 'material-ui/svg-icons/image/remove-red-eye'

import {CLIMATE_ZONE_UPDATE} from '../actions'
import {checkNumber} from '../util'

const climate_names = ["Arid","Semiarid","Tropical","Temperate (Warm)",
               "Temperate (Cold)","Subarctic","Arctic"]

function updatePercentsFn(index,value){
  let bValue = Math.min(1,Math.max(0,value))
  return (percents) => {
    return percents.withMutations(percents => {
      percents = percents.set(index,bValue)
      let delta = (1 - percents.reduce((x,y) => x+y))/(percents.count()-1)
      
      for(let i=0;i<percents.count();i++){
        if(i != index){
          percents = percents.update(i,x => Math.min(1,Math.max(0,x + delta)))
        }
      }
      return percents
    })
  }
}

class ClimateZoneDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      climate_zones: this.props.climate_zones,
      colorby: this.props.colorby
    }
  }
  componentWillMount(){
    this.setState({
      climate_zones: this.props.climate_zones,
      colorby: this.props.colorby
    })
  }

  setClimate(keys,value){
    if(keys[0] == 'percent')
      this.setState({
        climate_zones: this.state.climate_zones.update('percent',
                                       updatePercentsFn(keys[1],value)),
        colorby: "climate_zones"
      })
    else
      this.setState({
        climate_zones: this.state.climate_zones.setIn(keys,value),
        colorby: "climate_zones"
      })
  }
  climate(keys){
    return this.state.climate_zones.getIn(keys)
  }

  setActive(str){
    this.setState(state => this.state.colorby !== str ?
                         {colorby: str} : {colorby: "climate_zones"})
  }
  iconColor(str){
    return str === this.state.colorby ? "black" : "darkgray"
  }


  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0, marginBottom: "1em"}}>Climate Zones</h3>
          <FlatButton onClick={() => this.setActive("climate_zones")}
                      label="Display" icon={<ViewIcon/>}
                      style={{color: this.iconColor("climate_zones")}}/>
          <Table selectable={false}>

            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Climate</TableHeaderColumn>
                <TableHeaderColumn>% of map</TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody displayRowCheckbox={false}>
              {(_.map(climate_names,(climate,index) => 
                <TableRow key={index}>
                  <TableRowColumn>{climate}</TableRowColumn>

                  <TableRowColumn>
                    <Slider key={"pslider"}
                            value={this.climate(["percent",index])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setClimate(['percent',index],v)}/>
                  </TableRowColumn>
                </TableRow>))}
            </TableBody>
          </Table>

          <div style={{width: "1em", height: "3em"}}/>

          <RaisedButton style={{position: "absolute",
                                bottom: "1em", right: "1em"}}
                        primary={true}
                        onClick={() =>
                          this.props.onClimateUpdate(this.state)}>
            Render
          </RaisedButton>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {
    climate_zones: state.map.settings.get('climate_zones'),
    colorby: state.map.settings.get('colorby')
  }
},dispatch => {
  return {
    onClimateUpdate: (state) => {
      dispatch({
        type: CLIMATE_ZONE_UPDATE,
        value: state.climate_zones,
        colorby: state.colorby
      })
    }
  }
})(ClimateZoneDialog)
