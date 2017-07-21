import React from 'react'
import {connect} from 'react-redux'

import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import {COLORBY_UPDATE} from '../actions'

class ViewDialog extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return (
      <Paper zDepth={2} className={"terrain-view"}>
        <div style={{padding: "12pt"}}> 
          <h3 style={{margin: 0, marginBottom: "1em"}}>View</h3>
          <RadioButtonGroup name="" valueSelected={this.props.colorby}
                            onChange={(e,v) => this.props.onColorby(v)}>
            <RadioButton value="terrain" label="Terrain"/>
            <RadioButton value="zones" label="Zones"/>
            <RadioButton value="temp" label="Temperature"/>
            <RadioButton value="moist" label="Moisture"/>
            <RadioButton value="tiles" label="Tiles"/>
          </RadioButtonGroup>
        </div>
      </Paper>
    )
  }
}

export default connect(state => {
  return {
    colorby: state.map.settings.get('colorby')
  }
},dispatch => {
  return {
    onColorby: (str) => {
      dispatch({
        type: COLORBY_UPDATE,
        value: str
      })
    }
  }
})(ViewDialog)
