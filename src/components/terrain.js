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

import {TERRAIN_UPDATE, LOADING} from '../actions'
import map_update from '../actions/map_update'

import {randomStr,checkNumber,DEFAULT_COLORBY} from '../util'

class TerrainDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {terrain: this.props.terrain, colorby: this.props.colorby}
  }

  componentWillMount(){
    this.setState({terrain: this.props.terrain, colorby: this.props.colorby})
  }

  setTerrain(key,value){
    this.setState({terrain: this.state.terrain.set(key,value)})
  }
  terrain(key){
    return this.state.terrain.get(key)
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
          <h3 style={{margin: 0}}>Terrain</h3>
          <Table selectable={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn style={padding}>smoothness</TableHeaderColumn>
                <TableHeaderColumn width={"100em"}
                  style={{padding: "0.5em", textAlign: "right"}}>
                  seed
                </TableHeaderColumn>
                <TableHeaderColumn>width</TableHeaderColumn>
                <TableHeaderColumn>height</TableHeaderColumn>
                <TableHeaderColumn/>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>

              <TableRow>
                <TableRowColumn style={padding}>
                  <Slider value={this.terrain("smoothness")}
                    sliderStyle={{margin: "0.2em"}}
                    onChange={(e,v) => this.setTerrain('smoothness',v)}/>
                </TableRowColumn>
                <TableRowColumn width={"100em"} style={padding}>
                  <IconButton onClick={() => this.setTerrain("seed",randomStr())}>
                    <RefreshIcon/>
                  </IconButton>
                  <TextField value={this.terrain("seed")} id="seed"
                    onChange={(e,v) => this.setTerrain("seed",v)}/>
                </TableRowColumn>
                <TableRowColumn>
                  <TextField value={this.terrain("width")} id="width"
                    style={{width: "5em"}}
                    onChange={(e,v) => this.setTerrain("width",v)}
                    errorText={checkNumber("width",
                                           this.terrain("width"))}/>
                </TableRowColumn>
                <TableRowColumn>
                  <TextField value={this.terrain("height")} id="height"
                    style={{width: "5em"}}
                    onChange={(e,v) => this.setTerrain("height",v)}
                    errorText={checkNumber("height",
                                           this.terrain("height"))}/>
                </TableRowColumn>
                <TableRowColumn>
                  <IconButton onClick={() => this.setActive("terrain")}>
                    <ViewIcon color={this.iconColor("terrain")}/>
                  </IconButton>
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>

          <TextField value={this.terrain("mile_width")}
            floatingLabelText="Width in Miles"
            onChange={(e,v) => this.setTerrain("mile_width",v)}
            errorText={checkNumber("width",this.terrain("mile_width"))}/>

          <div style={{width: "1em", height: "3em"}}/>
          <RaisedButton style={{position: "absolute",
                                bottom: "1em", right: "1em"}}
            disabled={this.props.load_pending}
            primary={true}
            onClick={() =>
              this.props.onTerrainUpdate(this.props.state,this.state)}>
            Render
          </RaisedButton>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {
    terrain: state.map.settings.get('terrain'),
    colorby: state.map.settings.get('colorby'),
    state: state.map,
    load_pending: state.map.data == LOADING
  }
},dispatch => {
  return {
    onTerrainUpdate: (map_state,state) => {
      map_update(dispatch,map_state,{
        type: TERRAIN_UPDATE,
        value: state.terrain.toJS(),
        colorby: state.colorby
      })
    }
  }
})(TerrainDialog)
