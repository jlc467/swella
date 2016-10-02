import React, { Component } from 'react'
/* global mapboxgl */

class MapContainer extends Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
    this.map = new mapboxgl.Map({
        container: 'glmap',
        style: 'mapbox://styles/mapbox/streets-v9'
    })
  }
  render() {
    return (
      <div className="MapContainer">
        <div id="glmap"/>
      </div>
    )
  }
}

export default MapContainer
