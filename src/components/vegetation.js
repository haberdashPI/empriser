import React from 'react'
import {connect} from 'react-redux'
import _ from 'underscore'
import {randomStr} from '../util'

import {Table,TableBody,TableHeader,TableHeaderColumn,
        TableRow,TableRowColumn} from 'material-ui/Table';
import TextField from 'material-ui/TextField'
import Slider from 'material-ui/Slider'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import ViewIcon from 'material-ui/svg-icons/image/remove-red-eye'
import RefreshIcon from 'material-ui/svg-icons/action/cached'

import {CLIMATE_ZONE_UPDATE} from '../actions'
import {checkNumber} from '../util'

const vegetation = ["forrest","evergreen","jungle","bush","wetland"]

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

class VegetationDialog extends React.Component{
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

  setTile(keys,value){
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
  tile(keys){
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
    let padding = {padding: "0.5em"}    
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0, marginBottom: "1em"}}>Vegetation</h3>
          <FlatButton onClick={() => this.setActive("climate_zones")}
                      label="Display" icon={<ViewIcon/>}
                      style={{color: this.iconColor("climate_zones")}}/>
          <Table selectable={false}>

            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn width={"75em"} style={padding}>
                  Vegetation
                </TableHeaderColumn>
                <TableHeaderColumn style={padding}>
                  density
                </TableHeaderColumn>
                <TableHeaderColumn width={"100em"}>
                  smoothness
                </TableHeaderColumn>
                <TableHeaderColumn style={padding}>
                  seed
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody displayRowCheckbox={false}>
              {(_.map(vegetation,(veget,index) => 
                <TableRow key={index}>
                  <TableRowColumn width={"75em"} style={padding}>
                    {veget}
                  </TableRowColumn>

                  <TableRowColumn style={padding}>
                    <Slider key={"density"}
                            value={this.tile(["vegetation",
                                              veget,"density"])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setTile(["vegetation",
                                            veget,"density"],v)}/>
                  </TableRowColumn>
                  <TableRowColumn style={padding}>
                    <Slider key={"smoothness"}
                            value={this.tile(["vegetation",
                                              veget,"smoothness"])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setTile(["vegetation",
                                            veget,"smoothness"],v)}/>
                  </TableRowColumn>
                  <TableRowColumn width={"100em"} style={padding}>
                    <IconButton onClick={() =>
                      this.setTile(["vegetation",
                                    veget,"seed"],randomStr())}>
                      <RefreshIcon/>
                    </IconButton>
                    <TextField value={this.tile(["vegetation",
                                                 veget,"seed"])} id="seed"
                               onChange={(e,v) =>
                                 this.setTile(["vegetation"
                                              ,veget,"seed"],v)}/>
                  </TableRowColumn>                  
                </TableRow>))}
            </TableBody>
          </Table>

          <div style={{width: "1em", height: "3em"}}/>

          <RaisedButton style={{position: "absolute",
                                bottom: "1em", right: "1em"}}
                        primary={true}
                        onClick={() =>
                          this.props.onTileUpdate(this.state)}>
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
    onTileUpdate: (state) => {
      dispatch({
        type: CLIMATE_ZONE_UPDATE,
        value: state.climate_zones,
        colorby: state.colorby
      })
    }
  }
})(VegetationDialog)
