import React from 'react'
import {connect} from 'react-redux'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import FileInput from 'react-file-input'

export default class LoadButton extends FileInput{
  constructor(props){
    super(props)
  }

  loadMap(event){
    let reader = new FileReader()
    let fileName = event.target.files[0].name.replace(/\.json$/,'')
    reader.onload = event => {
      this.props.onLoad(fileName,JSON.parse(event.target.result))
    }
    reader.readAsText(event.target.files[0])
  }

  render(){
    const actions = [
      <FlatButton onClick={() => this.props.onCancel()}>
        Cancel
      </FlatButton>
    ]
      
    return (
      <Dialog title={"Load file"} actions={actions}
              modal={false} open={true}
              onRequestClose={() => this.props.onCancel()}>
        <form>
          <input type="file" onChange={e => this.loadMap(e)}/>
        </form>
      </Dialog>
    )
  }
}
