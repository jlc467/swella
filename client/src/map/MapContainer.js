import React, { Component } from 'react';
import { parseJSON, checkStatus, buildJSONRequest } from '../utility';
import { SWELLA_API_URL } from '../config';
import has from 'lodash/has';
import createHashHistory from 'history/createHashHistory';
const history = createHashHistory({ hashType: 'slash' });
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
// import 'mapbox-gl-geocoder/dist/'
// import 'mapbox-gl/dist/mapbox-gl.css'
/*global mapboxgl:true*/
/*global MapboxGeocoder:true*/
/*eslint no-undef: "error"*/
const setupMap = component => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiamNtdXNlIiwiYSI6ImVqMmlmeTQifQ.Z4cdYoe1Htq-9aEd5Qnjsw';
  component.map = new mapboxgl.Map({
    container: 'glmap',
    style: 'mapbox://styles/jcmuse/cih9a9bbq0023rom4g8ehgvf0'
  });
  // disable map rotation using right click + drag
  component.map.dragRotate.disable();
  // disable map rotation using touch rotation gesture
  component.map.touchZoomRotate.disableRotation();
  // setup geocoder
  component.geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    flyTo: false,
    zoom: false,
    country: 'us',
    types: 'region,postcode,place,locality,neighborhood,poi',
    placeholder: 'Where will you be boating out of?'
  });

  component.geocoder.on('result', ({ result }) => {
    console.log(result);
    if (has(result, 'geometry.coordinates')) {
      component.getNearbyZones({
        lat: result.geometry.coordinates[1],
        long: result.geometry.coordinates[0]
      });
      component.map.getSource('single-point').setData(result.geometry);
    }
  });
  component.map.on('load', () => {
    component.map.addSource('zones', { type: 'vector', url: 'mapbox://jcmuse.r53o9a4i' });

    component.map.addLayer({
      id: 'zones',
      type: 'fill',
      source: 'zones',
      'source-layer': 'zones-geometry-good',
      paint: { 'fill-outline-color': '#5888E8', 'fill-color': '#7D9FF5', 'fill-opacity': 0 }
    });
    component.map.addSource('single-point', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    component.map.addLayer({
      id: 'point',
      source: 'single-point',
      type: 'circle',
      paint: { 'circle-radius': 7, 'circle-color': '#FF8000' }
    });

    component.map.addLayer({
      id: 'zones-highlighted',
      type: 'fill',
      source: 'zones',
      'source-layer': 'zones-geometry-good',
      paint: { 'fill-outline-color': 'green', 'fill-opacity': 0.2 },
      filter: ['in', 'ID', '']
    });

    component.map.addLayer({
      id: 'zones-selected',
      type: 'fill',
      source: 'zones',
      'source-layer': 'zones-geometry-good',
      paint: { 'fill-outline-color': '#F2AE51', 'fill-opacity': 0.2 },
      filter: ['in', 'ID', '']
    });
    if (routeHasZoneId(history.location)) {
      const initialParams = getParamsFromLocation(history.location);
      component.getZoneById(initialParams.zoneId, initialParams.zoomOutFactor);
    }
    component.map.addControl(component.geocoder);
    component.map.on('mousemove', e => {
      const features = component.map.queryRenderedFeatures(e.point, { layers: ['zones'] });
      // Change the cursor style as a UI indicator.
      component.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      if (!features.length) {
        component.map.setFilter('zones-highlighted', [
          'in',
          'ID',
          component.state.activeZone && component.state.activeZone.zoneId
            ? component.state.activeZone.zoneId.toUpperCase()
            : ''
        ]);
        return;
      }
      const feature = features[0];
      component.map.setFilter('zones-highlighted', ['in', 'ID', feature.properties.ID]);
    });
    component.map.on('click', e => {
      const features = component.map.queryRenderedFeatures(e.point, { layers: ['zones'] });
      component.map.getCanvas().style.cursor = features.length ? 'pointer' : '';

      if (!features.length) {
        return;
      }

      const feature = features[0];
      component.getZoneById(feature.properties.ID);
    });
  });
};

const getParamsFromLocation = location => {
  const toReturn = {
    zoneId: location.pathname.replace('/zoneId/', ''),
    zoomOutFactor: location.search.indexOf('zoomOutFactor') > -1
      ? location.search.replace('?zoomOutFactor=', '')
      : '0'
  };
  return toReturn;
};

const routeHasZoneId = location => location.pathname.indexOf('zoneId') > -1;

const setupRouteListener = component => {
  history.listen((location, action) => {
    if (routeHasZoneId(location)) {
      const newParams = getParamsFromLocation(location);
      console.log(newParams);
      component.getZoneById(newParams.zoneId, newParams.zoomOutFactor);
    }
  });
};

class MapContainer extends Component {
  state = { activeZone: null, zoomOutFactor: null };
  componentDidMount() {
    setupRouteListener(this);
    setupMap(this);
  }
  handleZoneZoom = () => {
    this.map.once('zoomend', e => {
      this.map.once('zoomend', e => {
        console.log('has zoom out factor', e.zoomOutFactor);
        if (e.zoomOutFactor) {
          const newZoomLevel = this.map.getZoom() * ((100 - e.zoomOutFactor) / 100);
          console.log(newZoomLevel, 'newZoomLevel');
          this.map.jumpTo({ zoom: newZoomLevel });
        }
      });
      this.map.fitBounds(
        this.state.activeZone.bbox,
        { easing: () => 1, linear: false, padding: 200 },
        { zoomOutFactor: this.state.zoomOutFactor }
      );

      this.map.setFilter('zones-selected', [
        'in',
        'ID',
        this.state.activeZone.zoneId.toUpperCase()
      ]);
    });
    this.map.jumpTo({
      zoom: this.map.getZoom() + 0.00001
    }); // change bounds to force fitBounds to trigger zoomend
  };
  getNearbyZones = coordinates => {
    this.setState({ activeZone: null }, () => {
      fetch(`${SWELLA_API_URL}/getNearbyZones`, buildJSONRequest('post', { coordinates }))
        .then(checkStatus)
        .then(parseJSON)
        .then(activeZone => {
          this.setState({ activeZone });
        })
        .catch(error => {
          console.log(error);
        });
    });
  };
  getZoneById = (zoneId, zoomOutFactor) => {
    window.document.title = 'empty';
    if (this.state.activeZone && this.state.activeZone.zoneId === zoneId) {
      // short circuit data call
      window.document.title = zoneId;
      this.setState({ zoomOutFactor }, () => this.handleZoneZoom());
      return;
    }
    this.setState({ activeZone: null }, () => {
      fetch(`${SWELLA_API_URL}/getZoneById`, buildJSONRequest('post', { zoneId }))
        .then(checkStatus)
        .then(parseJSON)
        .then(activeZone => {
          if (activeZone && activeZone.bbox) {
            window.document.title = zoneId;
            console.log(activeZone, 'activeZone');
            this.setState({ activeZone, zoomOutFactor }, () => this.handleZoneZoom());
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  };
  render() {
    return (
      <div className="MapContainer">
        <div id="glmap" />
      </div>
    );
  }
}

export default MapContainer;
