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
import ZoomInIcon from 'material-ui/svg-icons/action/zoom-in'
import ZoomOutIcon from 'material-ui/svg-icons/action/zoom-out'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import TerrainIcon from 'material-ui/svg-icons/image/landscape'
import ViewIcon from 'material-ui/svg-icons/image/remove-red-eye'
import VegetIcon from 'material-ui/svg-icons/image/nature'

import {ClimateIcon, ZoneIcon, ClimateZoneIcon} from './icons'
import {ZOOM,READY_MOVE} from '../actions'

import TerrainDialog from './terrain'
import ZoneDialog from './zone'
import MoistTempDialog from './moist_temp'
import ViewDialog from './view'
import ClimatesDialog from './climates'
import VegetationDialog from './vegetation'

injectTapEventPlugin();

class MapToolbar extends React.Component{
  constructor(props){
    super(props)
    this.state = {active: "", subactive: ""}
  }
  setActive(active,subactive=""){
    if(active === "move" && this.state.active !== "move")
      if(active == "move") this.props.onMoveable(true)
    else
      if(active == "move") this.props.onMoveable(false)

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
          <ZoneIcon color={this.iconColor("edit","zone")}/>
        </IconButton>
        <IconButton onClick={() => {
            this.setActive("edit","moist_temp")
        }}>
          <ClimateIcon color={this.iconColor("edit","moist_temp")}/>
        </IconButton>
        <IconButton onClick={() => {
            this.setActive("edit","climate")
        }}>
          <ClimateZoneIcon color={this.iconColor("edit","climate")}/>
        </IconButton>
        <IconButton onClick={() => {
            this.setActive("edit","vegetation")
        }}>
          <VegetIcon color={this.iconColor("edit","vegetation")}/>
        </IconButton>
      </ToolbarGroup>
    )
  }

  renderMove(){
    return (
      <ToolbarGroup>
        <IconButton onClick={() => this.props.onZoomIn()}>
          <ZoomInIcon/>
        </IconButton>
        <IconButton onClick={() => this.props.onZoomOut()}>
          <ZoomOutIcon/>
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
              <IconButton onClick={() => this.setActive("move")}>
                <PanToolIcon color={this.iconColor("move")}/>
              </IconButton>
              <IconButton onClick={() => this.setActive("view")}>
                <ViewIcon color={this.iconColor("view")}/>
              </IconButton>
              <IconButton onClick={() => this.setActive("edit")}>
                <EditIcon color={this.iconColor("edit")}/>
              </IconButton>
            </ToolbarGroup>
            
            {(this.state.active === "edit" ? this.renderEdit() : null)}
            {(this.state.active === "move" ? this.renderMove() : null)}
            
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
          {(this.state.active === "edit" &&
            this.state.subactive === "climate") ?
           <ClimatesDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "vegetation") ?
           <VegetationDialog/> : null}
          {(this.state.active === "view") ? <ViewDialog/> : null}
        </Paper>
      </MuiThemeProvider>
    )
  }
}

export default connect(state => {return {}},dispatch => {
  return {
    onZoomIn: () => {
      dispatch({type: ZOOM, value: Math.sqrt(2)})
    },
    onZoomOut: () => {
      dispatch({type: ZOOM, value: 1/Math.sqrt(2)})
    },
    onMoveable: (value) => {
      dispatch({type: READY_MOVE, value: value})
    }
  }
})(MapToolbar)
