import React from 'react'
import {connect} from 'react-redux'
import {randomStr, DEFAULT_COLORBY} from '../util'

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

import {CLIMATE_UPDATE, LOADING} from '../actions'
import map_update from '../actions/map_update'

class ClimateDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      moist: this.props.moist,
      temp: this.props.temp,
      colorby: this.props.colorby
    }
  }
  componentWillMount(){
    this.setState({
      moist: this.props.moist,
      temp: this.props.temp,
      colorby: this.props.colorby
    })
  }

  setTemp(keys,value){
    this.setState({temp: this.state.temp.setIn(keys,value), colorby: "temp"})
  }
  temp(keys){
    return this.state.temp.getIn(keys)
  }

  setMoist(keys,value){
    this.setState({moist: this.state.moist.setIn(keys,value), colorby: "moist"})
  }
  moist(keys){
    return this.state.moist.getIn(keys)
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
          <h3 style={{margin: 0}}>Climate</h3>
          <Table selectable={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn width={"75em"} style={padding}/>
                <TableHeaderColumn style={padding}>strength</TableHeaderColumn>
                <TableHeaderColumn style={padding}>noise</TableHeaderColumn>
                <TableHeaderColumn style={padding}>smoothness</TableHeaderColumn>
                <TableHeaderColumn width={"100em"}
                                   style={{padding: "0.5em", textAlign: "right"}}>
                  seed
                </TableHeaderColumn>
                <TableHeaderColumn/>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>

              <TableRow>
                <TableRowColumn width={"75em"} style={padding}>Moisture</TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"moist_strength"}
                          value={this.moist(["strength"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setMoist(["strength"],v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"moist_noise"}
                          value={this.moist(["noise"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setMoist(["noise"],v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"moist_smooth"}
                          value={this.moist(["smoothness"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setMoist(["smoothness"],v)}/>
                </TableRowColumn>
                <TableRowColumn width={"100em"} style={padding}>
                  <IconButton onClick={() => this.setMoist(["seed"],randomStr())}>
                    <RefreshIcon/>
                  </IconButton>
                  <TextField value={this.moist(["seed"])} id="moist"
                             onChange={(e,v) => this.setMoist(["seed"],v)}/>
                </TableRowColumn>
                <TableRowColumn>
                  <IconButton onClick={() => this.setActive("moist")}>
                    <ViewIcon color={this.iconColor("moist")}/>
                  </IconButton>
                </TableRowColumn>
              </TableRow>

              <TableRow>
                <TableRowColumn style={padding} width={"75em"}>Temperature</TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"temp_strength"}
                          value={this.temp(["strength"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setTemp(["strength"],v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"temp_noise"}
                          value={this.temp(["noise"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setTemp(["noise"],v)}/>
                </TableRowColumn>
                <TableRowColumn style={padding}>
                  <Slider key={"temp_smooth"}
                          value={this.temp(["smoothness"])}
                          sliderStyle={{margin: "0.2em"}}
                          onChange={(e,v) => this.setTemp(["smoothness"],v)}/>
                </TableRowColumn>
                <TableRowColumn width={"100em"} style={padding}>
                  <IconButton onClick={() => this.setTemp(["seed"],randomStr())}>
                    <RefreshIcon/>
                  </IconButton>
                  <TextField value={this.temp(["seed"])} id="temp"
                             onChange={(e,v) => this.setTemp(["seed"],v)}/>
                </TableRowColumn>
                <TableRowColumn>
                  <IconButton onClick={() => this.setActive("temp")}>
                    <ViewIcon color={this.iconColor("temp")}/>
                  </IconButton>
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
          <div style={{width: "1em", height: "3em"}}/>
          <RaisedButton style={{position: "absolute",
                                bottom: "1em", right: "1em"}}
                        primary={true}
                        disabled={this.props.load_pending}
                        onClick={() =>
                          this.props.onMoistTempUpdate(
                            this.props.map_state,this.state)}>
            Render
          </RaisedButton>
        </div>
      </Paper>
    )
  }
}


export default connect(state => {
  return {
    temp: state.map.settings.get('temp'),
    moist: state.map.settings.get('moist'),
    colorby: state.map.settings.get('colorby'),
    map_state: state.map,
    load_pending: state.map.data == LOADING
  }
},dispatch => {
  return {
    onMoistTempUpdate: (map_state,state) => {
      map_update(dispatch,map_state,{
        type: CLIMATE_UPDATE,
        temp: state.temp.toJS(),
        moist: state.moist.toJS(),
        colorby: state.colorby
      })
    }
  }
})(ClimateDialog)
