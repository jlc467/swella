import React, {Component} from 'react';
import MapContainer from './map/MapContainer';

class App extends Component {
  render() {
    return (
      <div className='AppContainer'>
        <MapContainer />
      </div>
    );
  }
}

export default App