import React from 'react'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import Download from '@axetroy/react-download'
import TextField from 'material-ui/TextField'

export default class SaveDialog extends React.Component{
  constructor(props){
    super(props)
    this.state = {filename: props.filename}
  }
  componentWillMount(){
    this.setState({filename: this.props.filename})
  }

  render(){
    const actions = [
      <FlatButton onClick={() => this.props.onCancel()}>
        Cancel
      </FlatButton>,
      <Download file={this.state.filename+".json"}
                content={this.props.data}
                style={{display: "inline"}}>
        <FlatButton primary={true}
                    onClick={() =>
                      this.props.onConfirm(this.state.filename)}>
          Save
        </FlatButton>
      </Download>        
    ]
    
    return (
      <Dialog
        title = {"Save as…"}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={() => this.props.onCancel()}>
        
        <TextField value={this.state.filename}
                   onChange={(e,v) => this.setState({filename: v})}
                   floatingLabelText={"Filename"}/>
      </Dialog>
    )
  }
}
