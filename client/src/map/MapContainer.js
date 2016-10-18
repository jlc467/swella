import React, { Component } from 'react'
import { parseJSON, checkStatus, buildJSONRequest } from '../utility'
import { SWELLA_API_URL } from '../config'
import has from 'lodash/has'
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
// import 'mapbox-gl-geocoder/dist/'
// import 'mapbox-gl/dist/mapbox-gl.css'
/*global mapboxgl:true*/
/*eslint no-undef: "error"*/

const setupMap = component => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
  component.map = new mapboxgl.Map({
    container: 'glmap',
    style: 'mapbox://styles/jcmuse/ciubuehhf003l2ipixkxcllyk'
  })
  // disable map rotation using right click + drag
  component.map.dragRotate.disable()
  // disable map rotation using touch rotation gesture
  component.map.touchZoomRotate.disableRotation()
  // setup geocoder
  component.geocoder = new mapboxgl.Geocoder({
    flyTo: false,
    zoom: false,
    position: "top-left",
    country: 'us',
    types: 'region,postcode,place,locality,neighborhood,poi',
    placeholder: 'Where will you be boating out of?'
  })
  component.geocoder.on('result', () => {
    const result = component.geocoder.getResult()
    if (has(result, 'geometry.coordinates')) {
      component.getNearbyZones({
        "lat": result.geometry.coordinates[1],
        "long": result.geometry.coordinates[0]
      })
    }
  })
  component.map.on('load', () => {

    component.map.addSource('zones', {
      "type": "vector",
      "url": "mapbox://jcmuse.r53o9a4i"
    })

    component.map.addLayer({
      "id": "zones",
      "type": "fill",
      "source": "zones",
      "source-layer": "zones-geometry-good",
      "paint": {
        "fill-outline-color": "#5888E8",
        "fill-color": "#7D9FF5"
      }
    })

    component.map.addLayer({
      "id": "zones-highlighted",
      "type": "fill",
      "source": "zones",
      "source-layer": "zones-geometry-good",
      "paint": {
        "fill-outline-color": "#28CDA3",
        "fill-color": "#28CDA3",
      },
      "filter": ["in", "ID", ""]
    })
    const bbox = [ -82.83236099999993,
    27.462517000000048,
    -82.38283998199995,
    28.037895203000062 ]
    component.map.fitBounds(bbox, {padding: 20})
    // setTimeout(pitch, 1000)
    // function pitch() {
    //   component.map.easeTo({pitch: 60, duration: 2000})
    //   setTimeout(unpitch, 2500)
    // }
    // function unpitch() {
    //   component.map.easeTo({pitch: 0, duration: 2000})
    //   setTimeout(pitch, 2500)
    // }
    component.map.addControl(component.geocoder)
    component.map.on('mousemove', (e) => {
      const features = component.map.queryRenderedFeatures(e.point, {
        layers: ['zones']
      })
      // Change the cursor style as a UI indicator.
      component.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

      if (!features.length) {
        component.map.setFilter('zones-highlighted', ['in', 'ID', ''])
        return
      }

      const feature = features[0]
      component.map.setFilter('zones-highlighted', ['in', 'ID', feature.properties.ID])
    })
  })

}

class MapContainer extends Component {
  state = {
    nearbyZones: null
  }
  componentDidMount() {setupMap(this)}
  componentWillUpdate(nextProps, nextState) {
    if (!this.state.nearbyZones && nextState.nearbyZones) {
      const feature = nextState.nearbyZones.features[0]
      this.map.setFilter('zones-highlighted', ['in', 'ID', feature.id.toUpperCase()])
    }
  }
  getNearbyZones = coordinates => {
    this.setState({ nearbyZones: null },
      () => {
        fetch(`${SWELLA_API_URL}/getNearbyZones`,
          buildJSONRequest('post', { coordinates })
        )
        .then(checkStatus)
        .then(parseJSON)
        .then(nearbyZones => {
          console.log(nearbyZones)
          this.setState({ nearbyZones })
        })
        .catch(error => {
          console.log(error)
        })
      }
    )
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
