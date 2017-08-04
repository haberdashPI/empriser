import React from 'react'
import {connect} from 'react-redux'
import $ from 'jquery'
import {Toolbar, ToolbarGroup, ToolbarSeparator,
        ToolbarTitle} from 'material-ui/Toolbar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'

import MoveIcon from 'material-ui/svg-icons/action/pan-tool'
import ZoomInIcon from 'material-ui/svg-icons/action/zoom-in'
import ZoomOutIcon from 'material-ui/svg-icons/action/zoom-out'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import TerrainIcon from 'material-ui/svg-icons/image/landscape'
import ViewIcon from 'material-ui/svg-icons/image/remove-red-eye'
import VegetIcon from 'material-ui/svg-icons/image/nature'

import {ClimateIcon, ZoneIcon, ClimateZoneIcon} from './icons'

import TerrainDialog from './terrain'
import TerrainZoneDialog from './terrain_zone'
import ClimateDialog from './climate'
import ClimateZoneDialog from './climate_zone'
import VegetationDialog from './vegetation'

import ViewDialog from './view'
import SaveDialog from './save'
import LoadDialog from './load'

import {LOAD_MAP} from '../actions'
import map_update from '../actions/map_update'

injectTapEventPlugin();

class MapToolbar extends React.Component{
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
        {/* <IconButton onClick={() => {
            this.setActive("edit","vegetation")
            }}>
            <VegetIcon color={this.iconColor("edit","vegetation")}/>
            </IconButton> */}
      </ToolbarGroup>
    )
  }

  render(){
    let dobj = this.props.map_settings.toJS()
    let ddata = JSON.stringify(dobj);

    return (
      <MuiThemeProvider>
        <Paper zDepth={2}>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <IconButton onClick={() => this.setActive("view")}>
                <ViewIcon color={this.iconColor("view")}/>
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
                <MenuItem primaryText="Save…"
                          onClick={() => this.setState({saveOpen: true})}/>
                <MenuItem primaryText="Load…"
                          onClick={() => this.setState({loadOpen: true})}/>
              </IconMenu>
            </ToolbarGroup>
          </Toolbar>
          {(!this.state.loadOpen ? null :
            <LoadDialog
              onLoad={
                (name,data) => {
                  this.setState({
                    filename: name,
                    loadOpen: false
                  })
                  this.props.onLoad(this.props.map_state,data)
                }}
              onCancel={() => this.setState({loadOpen: false})}/>)}
          {(!this.state.saveOpen ? null :
            <SaveDialog
              data={ddata}
              filename={this.state.filename || "map"}
              onConfirm={(name) => this.setState({
                  saveOpen: false,
                  filename: name
              })}
              onCancel={() => this.setState({saveOpen: false})}/>)}
          {(this.state.active === "edit" &&
            this.state.subactive === "terrain") ?
           <TerrainDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "zone") ?
           <TerrainZoneDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "moist_temp") ?
           <ClimateDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "climate") ?
           <ClimateZoneDialog/> : null}
          {(this.state.active === "edit" &&
            this.state.subactive === "vegetation") ?
           <VegetationDialog/> : null}
          {(this.state.active === "view") ? <ViewDialog/> : null}
        </Paper>
      </MuiThemeProvider>
    )
  }
}

export default connect(state => {
  return {
    map_settings: state.map.settings,
    map_state: state.map
  }
},dispatch => {
  return {
    onLoad: (map_state,map_settings) => {
      map_update(dispatch,map_state,{
        type: LOAD_MAP,
        value: map_settings
      })
    }
  }
})(MapToolbar)
