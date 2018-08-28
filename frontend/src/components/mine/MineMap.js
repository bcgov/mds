import React, { Component } from 'react';
import { Map, Scene, WebMap, WebScene } from 'react-arcgis';

class MineMap extends Component {
  render() {
    return (
      <Scene
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [48.4284, -123.3656],
          zoom: 3
        }}
      />
    );
  }
}

export default MineMap;