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

import {ZONE_UPDATE} from '../actions'
import {checkNumber} from '../util'

const zones = ["Ocean","Land","Hills","Mountains"]

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

class ZoneDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {zones: this.props.zones}
  }
  componentWillMount(){
    this.setState({zones: this.props.zones})
  }

  setZone(keys,value){
    if(keys[0] == 'percent')
      this.setState({
        zones: this.state.zones.update('percent',
                                       updatePercentsFn(keys[1],value))})
    else
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
          <Table selectable={false}>

            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Zone</TableHeaderColumn>
                <TableHeaderColumn>% of map</TableHeaderColumn>
                <TableHeaderColumn>depth</TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody displayRowCheckbox={false}>
              {(_.map(zones,(zone,index) => 
                <TableRow key={index}>
                  <TableRowColumn>{zone}</TableRowColumn>

                  <TableRowColumn>
                    <Slider key={"pslider"} value={this.zone(["percent",index])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setZone(['percent',index],v)}/>
                  </TableRowColumn>

                  <TableRowColumn>
                    <Slider key={"dslider"} value={this.zone(["depth",index])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setZone(['depth',index],v)}/>
                  </TableRowColumn>

                </TableRow>))}
            </TableBody>
          </Table>
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
