import React from 'react'
import {connect} from 'react-redux'

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

import {RIVER_UPDATE, LOADING} from '../actions'
import map_update from '../actions/map_update'

import {randomStr,checkNumber,DEFAULT_COLORBY} from '../util'

class RiversDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {rivers: this.props.rivers, colorby: this.props.colorby}
  }

  componentWillMount(){
    this.setState({rivers: this.props.rivers, colorby: this.props.colorby})
  }

  setRiver(key,value){
    this.setState({rivers: this.state.rivers.set(key,value)})
  }
  river(key){
    return this.state.rivers.get(key)
  }

  setActive(str){
    this.setState(state => this.state.colorby !== str ?
                         {colorby: str} : {colorby: DEFAULT_COLORBY})
  }

  iconColor(str){
    return str === this.state.colorby ? "black" : "darkgray"
  }

  render(){
    let padding = {padding: "0.5em"}
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0}}>Rivers</h3>
          <FlatButton onClick={() => this.setActive("climate_zones")}
            label="Display" icon={<ViewIcon/>}
            style={{color: this.iconColor("climate_zones")}}/>

          <br/>
          <Table selectable={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn style={padding}>density</TableHeaderColumn>
                <TableHeaderColumn style={padding}>
                  momentum
                </TableHeaderColumn>
                <TableHeaderColumn style={padding}>
                  randomness
                </TableHeaderColumn>
                <TableHeaderColumn width={"100em"}
                  style={{padding: "0.5em", textAlign: "right"}}>
                  seed
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn style={padding}>
                  <Slider value={this.river("density")}
                    sliderStyle={{margin: "0.2em"}}
                    onChange={(e,v) => this.setRiver('density',v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider value={this.river("momentum")}
                    sliderStyle={{margin: "0.2em"}}
                    onChange={(e,v) => this.setRiver('momentum',v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider value={this.river("randomness")}
                    sliderStyle={{margin: "0.2em"}}
                    onChange={(e,v) => this.setRiver('randomness',v)}/>
                </TableRowColumn>
                <TableRowColumn>
                  <IconButton onClick={() => this.setRiver("seed",randomStr())}>
                    <RefreshIcon/>
                  </IconButton>
                  <TextField value={this.river("seed")} id="seed"
                    onChange={(e,v) => this.setRiver("seed",v)}/>
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>

          <div style={{width: "1em", height: "3em"}}/>
          <RaisedButton style={{position: "absolute",
                                bottom: "1em", right: "1em"}}
            disabled={this.props.load_pending}
            primary={true}
            onClick={() =>
              this.props.onRiversUpdate(this.props.state,this.state)}>
            Render
          </RaisedButton>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {
    rivers: state.map.settings.get('rivers'),
    colorby: state.map.settings.get('colorby'),
    state: state.map,
    load_pending: state.map.data == LOADING
  }
},dispatch => {
  return {
    onRiversUpdate: (map_state,state) => {
      map_update(dispatch,map_state,{
        type: RIVER_UPDATE,
        value: state.rivers.toJS(),
        colorby: state.colorby
      })
    }
  }
})(RiversDialog)
