/**
 * @class MineMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 */
import React, { Component } from 'react';
import { Map } from 'react-arcgis';
import PropTypes from 'prop-types';
import MinePin from './MinePin';
import LocationPin from './LocationPin';

const propTypes = {
  mine: PropTypes.object,
  lat: PropTypes.number.isRequired,
  long: PropTypes.number.isRequired
};

const defaultProps = {
  mine: null,
};

class MineMap extends Component {
  state = { map: null, view: null, updated: false }


  componentWillReceiveProps(nextProps) {
    if ((nextProps.lat != this.props.lat) || (nextProps.long != this.props.long)) {
      let newView = this.state.view;
      newView.center = [nextProps.long, nextProps.lat];
      this.setState({view: newView, updated: !this.state.updated});
    }
  }

  handleLoadMap = (map, view) => {
    this.setState({map, view})
  }

  renderPin() {
    // if (this.state.updated) {
      return (
        <div>
          <LocationPin className="loaction-pin" lat={this.props.lat} long={this.props.long}/>
        </div>
      )
    // }
  }

  render() {
    if (this.props.mine) {
      const { mine } = this.props;
      return (
        // default to the center of BC and change zoom level if mine location does not exist.
        <Map
          style={{ width: '100vw', height: '475px' }}
          mapProperties={{ basemap: 'streets' }}
          viewProperties={{
            center: [
              mine.mine_location[0] ? mine.mine_location[0].longitude : -127.6476,
              mine.mine_location[0] ? mine.mine_location[0].latitude : 53.7267
            ],
            zoom: mine.mine_location[0] ? 8 : 4
          }}
          onLoad={this.handleLoadMap}
          >
          <MinePin/>
        </Map>
      );
    } 
    return (
      // default to the center of BC and change zoom level if mine location does not exist.
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
      >
        {/* `{this.state.updated && this.renderPin()}` */}
        <MinePin />
      </Map>
    );

    
  }
}

MineMap.propTypes = propTypes;
MineMap.defaultProps = defaultProps;
export default MineMap;