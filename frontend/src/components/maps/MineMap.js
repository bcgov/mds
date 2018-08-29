/**
 * @class MineMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 */
import React, { Component } from 'react';
import { Map } from 'react-arcgis';
import PropTypes from 'prop-types';
import MapPin from './MapPin';

const propTypes = {
  mine: PropTypes.object
};

const defaultProps = {
  mine: {}
};

class MineMap extends Component {

  render() {
    return (
      <Map
        style={{ width: '100vw', height: '475px' }}
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [-123.657985, 48.474752],
          zoom: 8
        }}
      >
        <MapPin />
      </Map>
    );
  }
}

MineMap.propTypes = propTypes;
MineMap.defaultProps = defaultProps;
export default MineMap;