/**
 * @class LocationPin.js must be the child of arcGIS <Map /> or <Sceen />,
 * LocationPin is connected to redux to access/display all mines information - reusalble on any view will display the
 *
 */
import React, { Component } from 'react';
import { loadModules } from 'react-arcgis';
import PropTypes from 'prop-types';

const propTypes = {
  center: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired
};

const defaultProps = {
  view: {},
  map: {}
};

// const markerSymbol = {
//   type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
//   style: "circle",
//   color: [244, 67, 54, 0.84],
//   size: "10px"
// };


export class LocationPin extends Component {
  state = { graphic: null, layer: null };

  renderGraphic = (props) => {
    loadModules(['esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/symbols/SimpleMarkerSymbol', "dojo/_base/Color"])
      .then(([Graphic, GraphicsLayer, SimpleMarkerSymbol, Color]) => {
        const symbol = new SimpleMarkerSymbol("solid", 14, null, new Color("red"));
        const point = {
          type: "point",
          longitude: props[0],
          latitude: props[1]
        };

        const graphic =
          new Graphic({
            geometry: point,
            symbol: symbol,
          });

        var layer = new GraphicsLayer({
          id: 'pulse',
          graphics: [graphic],
        });

        this.props.map.remove(this.state.layer);
        this.props.map.add(layer);
        this.setState({ graphic, layer });
        
      });
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.center !== this.props.center) {
      this.renderGraphic(nextProps.center);
    }
  }

  componentWillMount() {
    this.renderGraphic(this.props.center);
  }

  componentWillUnmount() {
    this.props.map.remove(this.state.layer);
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