import React from 'react'
import {Toolbar, ToolbarGroup, ToolbarSeparator,
        ToolbarTitle} from 'material-ui/Toolbar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Slider from 'material-ui/Slider'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'

import PanToolIcon from 'material-ui/svg-icons/action/pan-tool'
import ZoomIcon from 'material-ui/svg-icons/action/search'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import SvgIcon from 'material-ui/SvgIcon';

injectTapEventPlugin();

class _MapToolbar extends React.Component{
  constructor(props){
    super(props)
    this.state = {smoothness: 0.5, active: "", subactive: ""}
  }
  setActive(active,subactive=""){
    this.setState(state => {
      if(state.active == active){
        if(subactive == "")
          return {active: "", subactive: ""}
        else if(state.subactive == subactive)
          return {active: active, subactive: ""}
        else
          return {active: active, subactive: subactive}
      }
      else{
        return {active: active, subactive: subactive}
      }
    })
  }
  iconColor(active,subactive=""){
    if(active === this.state.active &&
       (subactive === "" || subactive === this.state.subactive))
      return "black"
    else
      return "darkgray"
  }

  renderEdit(){
    return (
      <ToolbarGroup>
        <IconButton onClick={() => {
            this.updateTerrainDialog()
            this.setActive("edit","terrain")
          }}>
          <SvgIcon color={this.iconColor("edit","terrain")}>
            <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
          </SvgIcon>
        </IconButton>
      </ToolbarGroup>
    )
  }

  onSmoothness(event,value){
    this.setState({smoothness: value})
  }

  updateTerrainDialog(){
    this.setState({smoothness: this.props.map.get("smoothness")})
  }

  renderTerrainDialog(){
    if(this.state.active === "edit" && this.state.subactive === "terrain"){
      return (
        <Paper zDepth={2} className={"terrain-view"}>
          <div style={{padding: "12pt"}}>
            <p>Smoothness</p>
            <Slider value={this.state.smoothness}
                    onChange={(e,v) => this.onSmoothness(e,v)}/>
            <RaisedButton label="Primary"
                          onClick={() => this.props.onSmoothness(this.state.smoothness)}>
              Render
            </RaisedButton>
          </div>
        </Paper>
      )
    }else return null
  }

  render(){
    return (
      <MuiThemeProvider>
        <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <IconButton onClick={() => this.setActive("pan")}>
                <PanToolIcon color={this.iconColor("pan")}/>
              </IconButton>
              <IconButton onClick={() => this.setActive("zoom")}>
                <ZoomIcon color={this.iconColor("zoom")}/>
              </IconButton>
              <IconButton onClick={() => this.setActive("edit")}>
                <EditIcon color={this.iconColor("edit")}/>
              </IconButton>
            </ToolbarGroup>
            
            {(this.state.active === "edit" ? this.renderEdit() : null)}

            <ToolbarGroup lastChild={true}>
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}>
                <MenuItem primaryText="Save…"/>
                <MenuItem primaryText="Save Image…"/>
                <MenuItem primaryText="Load…"/>
                <MenuItem primaryText="Settings…"/>
              </IconMenu>
            </ToolbarGroup>
          </Toolbar>
          {this.renderTerrainDialog()}
        </div>
      </MuiThemeProvider>
    )
  }
}

export default const MapView = connect(state => return state,dispatch => {
  onSmoothness: (value) => {
    dispatch({type: "SMOOTHNESSS", value: value})
  }
})(_MapView)
