import React, { Component } from 'react'
import MapContainer from './map/MapContainer'
import createHashHistory from 'history/createHashHistory'

const history = createHashHistory({
  hashType: 'slash'
})

class App extends Component {
  componentDidMount() {
    const initialParams = {
      zoneId: history.location.pathname.replace('/zoneId/', ''),
      zoomLevel: history.location.search.indexOf('zoomLevel') > -1 ? history.location.search.replace('?zoomLevel=', '') : 'medium'
    }
    console.log(initialParams)
    history.listen((location, action) => {
      // location is an object like window.location
      console.log(location)
      if (location.pathname.indexOf('zoneId') > -1) {
        const params = {
          zoneId: location.pathname.replace('/zoneId/', ''),
          zoomLevel: location.search.indexOf('zoomLevel') > -1 ? location.search.replace('?zoomLevel=', '') : 'medium'
        }
        console.log(params)
      }
    })
  }
  render() {
    return (
      <div className="AppContainer">
        <MapContainer />
      </div>
    )
  }
}

export default App
