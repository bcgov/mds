/**
 * @class LocationPin.js must be the child of arcGIS <Map /> or <Sceen />,
 * LocationPin is connected to redux to access/display all mines information - reusalble on any view will display the
 *
 */
import React, { Component } from 'react';
import { loadModules } from 'react-arcgis';
import Lottie from 'react-lottie';
import PropTypes from 'prop-types';
import * as loader from '@/assets/loader.json';

const propTypes = {
  lat: PropTypes.number.isRequired,
  long: PropTypes.number.isRequired,
  view: PropTypes.object.isRequired
};

const defaultProps = {
  view: {}
};

// const symbol = {
//   "url": '../../../public/round.json',
//   "height": 40,
//   "width": 30,
//   "type": "picture-marker"
// };

var markerSymbol = {
  type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
  style: "circle",
  color: [51, 204, 51, 0.3],
  size: "8px", 
  declaredClass: 'location-pin'
};

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loader
};
export class LocationPin extends Component {
  state = { graphic: null };

  symbol = () => {
     return (
       <Lottie 
       options = { defaultOptions }
         />
     )
   }
  componentWillMount() {

    loadModules(['esri/Graphic']).then(([Graphic]) => {
      // create a new Graphic for every mine in the array or fetch the ID from the URL for a single mine.
      // data must be passed into this.points() and this.popupTemplate to associate the correct information with the correct lat/long.



      const point = {
        type: "point",
        longitude: this.props.long,
        latitude: this.props.lat,
      }

      const graphic =
          new Graphic({
          geometry: point,
          symbol: markerSymbol,
        })

      this.setState({ graphic: graphic });
      this.props.view.graphics.removeAll();
      this.props.view.graphics.add(graphic);
    });
  }

  componentWillUnmount() {
    this.props.view.graphics.remove(this.state.graphic);
  }
  render() {
    return (
      null
    );
  }
}

LocationPin.propTypes = propTypes;
LocationPin.defaultProps = defaultProps;

export default LocationPin;