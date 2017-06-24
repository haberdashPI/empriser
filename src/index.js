import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { createStore } from 'redux'

import './index.less'
import MapView from './components/mapview'
import MapToolbar from './components/toolbar'

import earhartReducer from './reducers'

let earhartStore = createStore(earhartReducer)

new MapView(document.getElementById('view'),earhartStore);
ReactDOM.render(<Provider store={earhartStore}><MapToolbar/></Provider>,
                document.getElementById('ui-view'))
