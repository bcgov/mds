import React, { Component } from 'react';
import { Map } from 'react-arcgis';
import PropTypes from 'prop-types';
import MinePin from './MinePin';
import LocationPin from './LocationPin';
import * as String from '@/constants/strings';

/**
 * @class MineMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 * MineMap.js is located on Landing page as well as Mine Summary page.
 */
const propTypes = {
  mine: PropTypes.object,
  lat: PropTypes.number,
  long: PropTypes.number
};

const defaultProps = {
  mine: null,
};

class MineMap extends Component {
  state = { map: null, view: null, center: null, zoom: null }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.lat != this.props.lat) || (nextProps.long != this.props.long)) {
      const newView = this.state.view;
      const center = [nextProps.long, nextProps.lat];
      newView.center = center;
      newView.zoom = 10;
      this.setState({view: newView, center});
    }
  }

  /**
   * handleLoadMap creates an instance of map and view to keep in state for later use, map and view are implicently passed into any children of <Map>
   */
  handleLoadMap = (map, view) => {
    this.setState({map, view})
  }

  renderPin() {
    if (this.state.center){
      return (
        <LocationPin center={this.state.center}/>
      )
    } else {
      return <div></div>;
    }
  }

  render() {
    if (this.props.mine) {
      const { mine } = this.props;
      return (
        // Map located on MineSummary page, - this.props.mine is available, contains 1 mine pin.
        // default to the center of BC and change zoom level if mine location does not exist.
        <Map
          style={{ width: '100%', height: '100%'}}
          mapProperties={{ basemap: 'streets' }}
          viewProperties={{
            center: [
              mine.mine_location[0] ? mine.mine_location[0].longitude : String.DEFAULT_LONG,
              mine.mine_location[0] ? mine.mine_location[0].latitude : String.DEFAULT_LAT
            ],
            zoom: mine.mine_location[0] ? 8 : 4
          }}
          onLoad={this.handleLoadMap}
          onMouseWheel={(event) => event.stopPropagation()}
          >
          <MinePin/>
        </Map>
      );
    }
    return (
      // Map located on landing page - contains all mine pins and adds a location pin when searched.
      // this.props.lat & this.props.long get changed in Dashboard.js
      <Map
        style={{ width: '100vw', height: '100vh' }}
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [
            this.props.long,
            this.props.lat
          ],
          zoom: 6
        }}
        onLoad={this.handleLoadMap}
        onMouseWheel={(event) => event.stopPropagation()}
      >
        {this.renderPin()}
        <MinePin />
      </Map>
    );


  }
}

MineMap.propTypes = propTypes;
MineMap.defaultProps = defaultProps;
export default MineMap;