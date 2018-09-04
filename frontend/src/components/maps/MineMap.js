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
      // default to the center of BC and change zoom level if mine location does not exist.
      <Map
        style={{ width: '100vw', height: '475px' }}
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [
            this.props.mine.mine_location[0] ? this.props.mine.mine_location[0].longitude : -127.6476,
            this.props.mine.mine_location[0] ? this.props.mine.mine_location[0].latitude : 53.7267
          ],
          zoom: this.props.mine.mine_location[0] ? 8 : 4
        }}
      >
        <MapPin/>
      </Map>
    );
  }
}

MineMap.propTypes = propTypes;
MineMap.defaultProps = defaultProps;
export default MineMap;