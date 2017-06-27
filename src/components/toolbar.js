import React from 'react'
import {connect} from 'react-redux'
import {Toolbar, ToolbarGroup, ToolbarSeparator,
        ToolbarTitle} from 'material-ui/Toolbar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'

import PanToolIcon from 'material-ui/svg-icons/action/pan-tool'
import ZoomIcon from 'material-ui/svg-icons/action/search'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import TerrainIcon from 'material-ui/svg-icons/image/landscape'
import ZoneIcon from 'material-ui/svg-icons/image/panorama'
//import SvgIcon from 'material-ui/SvgIcon';

import TerrainDialog from './terrain'

injectTapEventPlugin();

export default class MapToolbar extends React.Component{
  constructor(props){
    super(props)
    this.state = {active: "", subactive: ""}
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
            this.setActive("edit","terrain")
        }}>
          <TerrainIcon color={this.iconColor("edit","terrain")}/>
        </IconButton>
      </ToolbarGroup>
    )
  }

  render(){
    return (
      <MuiThemeProvider>
        <Paper zDepth={2}>
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
          {(this.state.active === "edit" && this.state.subactive === "terrain") ?
           <TerrainDialog/> : null}
        </Paper>
      </MuiThemeProvider>
    )
  }
}

