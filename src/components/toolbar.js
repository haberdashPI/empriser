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
import SvgIcon from 'material-ui/SvgIcon';

import TerrainDialog from './terrain'
import ZoneDialog from './zone'
import MoistTempDialog from './moist_temp'

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
        <IconButton onClick={() => {
            this.setActive("edit","zone")
        }}>
          <SvgIcon color={this.iconColor("edit","zone")}>
            <path d="M13.7,0H0v24h13.7l0-6H1l6-8c0,0,2.8,3.8,4.5,6l1.6-1.2L10.2,11l3.4-4.5L13.7,0"/>
            <polyline points="14,6 13.7,6.5 13.7,18 23,18 14,6 "/>
          </SvgIcon>
        </IconButton>
        <IconButton onClick={() => {
            this.setActive("edit","moist_temp")
        }}>
          <SvgIcon color={this.iconColor("edit","moist_temp")}>
            <g>
	          <path d="M20.8,0.7c-1.3-0.5-2.7,0-3.3,1.3l-5.8,13.5c0,0-0.1,0-0.2,0.1c-0.9,0.4-1.6,1.1-2,2c-0.4,0.9-0.4,1.9,0,2.8
		      c0.6,1.5,2,2.4,3.5,2.4c0.5,0,0.9-0.1,1.4-0.3c0.9-0.4,1.7-1.1,2-2c0.4-0.9,0.4-1.9,0-2.9c0-0.1,0-0.1-0.1-0.2L22.2,4
		      C22.7,2.7,22.1,1.2,20.8,0.7z M20.8,3.4l-2.2,5.1l-0.9-0.4L17.3,9l0.9,0.4l-1,2.4l-0.9-0.4l-0.4,0.9l0.9,0.4l-1,2.4l-0.9-0.4
		      l-0.4,0.9l0.9,0.4l0,0.1l-0.6,1.5c0.2,0.2,0.3,0.4,0.4,0.6c0.2,0.6,0.2,1.2,0,1.7c-0.2,0.5-0.7,1-1.2,1.2c-1.1,0.5-2.4-0.1-2.9-1.2
		      c-0.2-0.5-0.2-1.1,0-1.7c0.2-0.5,0.7-1,1.2-1.2c0.2-0.1,0.5-0.1,0.7-0.1l0.6-1.5L19,2.6c0.2-0.5,0.8-0.7,1.3-0.5
		      C20.8,2.3,21,2.9,20.8,3.4z"/>
            </g>
            <g>
	          <path fillRule="evenodd" clipRule="evenodd" d="M10.9,9.5c0,2.5-2,4.5-4.5,4.5C4,14,2,12,2,9.5c0-0.9,0.3-1.7,0.7-2.4l0-0.1
		      L6.5,2l3.7,5.1l0,0.1C10.6,7.8,10.9,8.6,10.9,9.5z"/>
            </g>
          </SvgIcon>
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
          {(this.state.active === "edit" &&
            this.state.subactive === "terrain") ?
           <TerrainDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "zone") ?
           <ZoneDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "moist_temp") ?
           <MoistTempDialog/> : null}
        </Paper>
      </MuiThemeProvider>
    )
  }
}

