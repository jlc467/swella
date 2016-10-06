import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
import 'mapbox-gl/dist/mapbox-gl.css'

class MapContainer extends Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
    this.map = new mapboxgl.Map({
      container: 'glmap',
      style: 'mapbox://styles/jcmuse/cikcm77hi007l9fm127xym4v1'
    })
    this.map.on('load', () => {
      this.map.addSource('zones', {
          "type": "vector",
          "url": "mapbox://jcmuse.r53o9a4i"
      })

      this.map.addLayer({
          "id": "zones",
          "type": "fill",
          "source": "zones",
          "source-layer": "zones-geometry-good",
          "paint": {
              "fill-outline-color": "rgba(0,0,0,0.1)",
              "fill-color": "rgba(0,0,0,0.1)"
          }
      })

      this.map.addLayer({
          "id": "zones-highlighted",
          "type": "fill",
          "source": "zones",
          "source-layer": "zones-geometry-good",
          "paint": {
              "fill-outline-color": "#5FB3B3",
              "fill-color": "#5FB3B3",
              "fill-opacity": 1
          },
          "filter": ["in", "ID", ""]
      })
      this.map.on('mousemove', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['zones']
        })
        // Change the cursor style as a UI indicator.
        this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

        if (!features.length) {
            this.map.setFilter('zones-highlighted', ['in', 'ID', ''])
            return
        }

        const feature = features[0]
        this.map.setFilter('zones-highlighted', ['in', 'ID', feature.properties.ID])
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
