import React, { Component } from 'react'
import { parseJSON, checkStatus, buildJSONRequest } from '../utility'
import { SWELLA_API_URL } from '../config'
import has from 'lodash/has'
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
// import 'mapbox-gl-geocoder/dist/'
// import 'mapbox-gl/dist/mapbox-gl.css'
/*global mapboxgl:true*/
/*global MapboxGeocoder:true*/
/*eslint no-undef: "error"*/


const setupMap = component => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
  component.map = new mapboxgl.Map({
    container: 'glmap',
    style: 'mapbox://styles/jcmuse/ciwtpzev9002h2prwecbbvcg1'
  })
  // disable map rotation using right click + drag
  component.map.dragRotate.disable()
  // disable map rotation using touch rotation gesture
  component.map.touchZoomRotate.disableRotation()
  // setup geocoder
  component.geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      flyTo: false,
      zoom: false,
      country: 'us',
      types: 'region,postcode,place,locality,neighborhood,poi',
      placeholder: 'Where will you be boating out of?'
  })

  component.geocoder.on('result', ({ result }) => {
    console.log(result)
    if (has(result, 'geometry.coordinates')) {
      component.getNearbyZones({
        "lat": result.geometry.coordinates[1],
        "long": result.geometry.coordinates[0]
      })
      component.map.getSource('single-point').setData(result.geometry)
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
        "fill-color": "#7D9FF5",
        "fill-opacity": 0
      }
    })
    component.map.addSource('single-point', {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": []
      }
    })
    component.map.addLayer({
      "id": "point",
      "source": "single-point",
      "type": "circle",
      "paint": {
        "circle-radius": 7,
        "circle-color": "#FF8000"
      }
    })

    component.map.addLayer({
      "id": "zones-highlighted",
      "type": "fill",
      "source": "zones",
      "source-layer": "zones-geometry-good",
      "paint": {
        "fill-outline-color": "#F2AE51",
        "fill-color": "#FFB454",
        "fill-opacity": .5
      },
      "filter": ["in", "ID", ""]
    })

    component.map.addLayer({
      "id": "zones-selected",
      "type": "fill",
      "source": "zones",
      "source-layer": "zones-geometry-good",
      "paint": {
        "fill-outline-color": "#F2AE51",
        "fill-color": "#FFB454",
        "fill-opacity": .5
      },
      "filter": ["in", "ID", ""]
    })

    //component.map.addControl(component.geocoder)
    component.map.on('mousemove', (e) => {
      const features = component.map.queryRenderedFeatures(e.point, {
        layers: ['zones']
      })
      // Change the cursor style as a UI indicator.
      component.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

      if (!features.length) {
        component.map.setFilter('zones-highlighted',
          [ 'in', 'ID', component.state.activeZone && component.state.activeZone.zoneId ? component.state.activeZone.zoneId.toUpperCase() : '' ]
        )
        return
      }

      const feature = features[0]
      component.map.setFilter('zones-highlighted', ['in', 'ID', feature.properties.ID])
    })
    component.map.on('click', (e) => {
      const features = component.map.queryRenderedFeatures(e.point, {
        layers: ['zones']
      })
      component.map.getCanvas().style.cursor = features.length ? 'pointer' : ''

      if (!features.length) {
        return
      }

      const feature = features[0]
      component.getZoneById(feature.properties.ID)
    })
  })

}

class MapContainer extends Component {
  state = {
    activeZone: null
  }
  componentDidMount() {setupMap(this)}
  componentWillUpdate(nextProps, nextState) {
    if (!this.state.activeZone && nextState.activeZone) {
      this.map.fitBounds(nextState.activeZone.bbox, { padding: 200 })
      this.map.setFilter('zones-selected', ['in', 'ID', nextState.activeZone.zoneId.toUpperCase()])
    }
  }
  getNearbyZones = coordinates => {
    this.setState({ activeZone: null },
      () => {
        fetch(`${SWELLA_API_URL}/getNearbyZones`,
          buildJSONRequest('post', { coordinates })
        )
        .then(checkStatus)
        .then(parseJSON)
        .then(activeZone => {
          this.setState({ activeZone })
        })
        .catch(error => {
          console.log(error)
        })
      }
    )
  }
  getZoneById = zoneId => {
    this.setState({ activeZone: null },
      () => {
        fetch(`${SWELLA_API_URL}/getZoneById`,
          buildJSONRequest('post', { zoneId })
        )
        .then(checkStatus)
        .then(parseJSON)
        .then(activeZone => {
          this.setState({ activeZone })
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
