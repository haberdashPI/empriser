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

import {TILES_UPDATE} from '../actions'
import {checkNumber} from '../util'

const tiles = ["Arid","Semiarid","Tropical","Temperate (Warm)",
               "Temperate (Cold)","Subarctic","Arctic"]
const vegetation = ["Forrest","Evergreen","Jungle","Bush","Wetland"]

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

class TilesDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {tiles: this.props.tiles, colorby: this.props.colorby}
  }
  componentWillMount(){
    this.setState({tiles: this.props.tiles, colorby: this.props.colorby})
  }

  setTile(keys,value){
    if(keys[0] == 'percent')
      this.setState({
        tiles: this.state.tiles.update('percent',
                                       updatePercentsFn(keys[1],value)),
        colorby: "tiles"
      })
    else
      this.setState({
        tiles: this.state.tiles.setIn(keys,value),
        colorby: "tiles"
      })
  }
  tile(keys){
    return this.state.tiles.getIn(keys)
  }

  setActive(str){
    this.setState(state => this.state.colorby !== str ?
                         {colorby: str} : {colorby: "tiles"})
  }
  iconColor(str){
    return str === this.state.colorby ? "black" : "darkgray"
  }


  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}>
          <h3 style={{margin: 0, marginBottom: "1em"}}>Climates</h3>
          <FlatButton onClick={() => this.setActive("tiles")}
                      label="Display" icon={<ViewIcon/>}
                      style={{color: this.iconColor("tiles")}}/>
          <Table selectable={false}>

            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Climate</TableHeaderColumn>
                <TableHeaderColumn>% of map</TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody displayRowCheckbox={false}>
              {(_.map(tiles,(climate,index) => 
                <TableRow key={index}>
                  <TableRowColumn>{climate}</TableRowColumn>

                  <TableRowColumn>
                    <Slider key={"pslider"} value={this.tile(["percent",index])}
                            sliderStyle={{margin: "0.2em"}}
                            onChange={(e,v) =>
                              this.setTile(['percent',index],v)}/>
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
    tiles: state.map.settings.get('tiles'),
    colorby: state.map.settings.get('colorby')
  }
},dispatch => {
  return {
    onTileUpdate: (state) => {
      dispatch({type: TILE_UPDATE, value: state.tile, colorby: state.colorby})
    }
  }
})(TilesDialog)
