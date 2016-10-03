import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
import 'mapbox-gl/dist/mapbox-gl.css'

class MapContainer extends Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
    this.map = new mapboxgl.Map({
      container: 'glmap',
      style: 'mapbox://styles/mapbox/streets-v9'
    })
    this.map.on('load', () => {
      // Add the source to query. In this example we're using
      // county polygons uploaded as vector tiles
      this.map.addSource('counties', {
          "type": "vector",
          "url": "mapbox://mapbox.82pkq93d"
      })

      this.map.addLayer({
          "id": "counties",
          "type": "fill",
          "source": "counties",
          "source-layer": "original",
          "paint": {
              "fill-outline-color": "rgba(0,0,0,0.1)",
              "fill-color": "rgba(0,0,0,0.1)"
          }
      }, 'place-city-sm') // Place polygon under these labels.

      this.map.addLayer({
          "id": "counties-highlighted",
          "type": "fill",
          "source": "counties",
          "source-layer": "original",
          "paint": {
              "fill-outline-color": "#484896",
              "fill-color": "#6e599f",
              "fill-opacity": 0.75
          },
          "filter": ["in", "COUNTY", ""]
      }, 'place-city-sm')
      this.map.on('mousemove', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['counties']
        })

        // Change the cursor style as a UI indicator.
        this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

        // Remove things if no feature was found.
        if (!features.length) {
            this.map.setFilter('counties-highlighted', ['in', 'COUNTY', ''])
            return
        }

        // Single out the first found feature on mouseove.
        const feature = features[0]

        // Add features that share the same county name to the highlighted layer.
        this.map.setFilter('counties-highlighted', ['in', 'COUNTY', feature.properties.COUNTY])
      })
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
