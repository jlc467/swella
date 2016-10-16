import React, { Component } from 'react'
import { parseJSON, checkStatus, buildJSONRequest } from '../utility'
import { SWELLA_API_URL } from '../config'
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
// import 'mapbox-gl-geocoder/dist/'
// import 'mapbox-gl/dist/mapbox-gl.css'
/*global mapboxgl:true*/
/*eslint no-undef: "error"*/



class MapContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nearbyZones: null
    }
  }
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw'
    this.map = new mapboxgl.Map({
      container: 'glmap',
      style: 'mapbox://styles/jcmuse/ciubuehhf003l2ipixkxcllyk'
    })
    this.geocoder = new mapboxgl.Geocoder({
      flyTo: false,
      zoom: false,
      position: "top-left",
      country: 'us',
      placeholder: 'Where will you be boating out of?'
    })
    this.geocoder.on('results', e => {
      console.log('results: ', e.results)
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
          "fill-outline-color": "#5888E8",
          "fill-color": "#7D9FF5"
        }
      })

      this.map.addLayer({
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
      this.map.addControl(this.geocoder)
      this.getNearbyZones({
        "lat":32.02940,
        "long":-87.70589
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
