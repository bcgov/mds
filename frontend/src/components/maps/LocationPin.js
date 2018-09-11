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

export class LocationPin extends Component {
  state = { graphic: null};

  renderGraphic = (props) => {
    loadModules(['esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', "dojo/_base/Color"])
      .then(([Graphic, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Color]) => {
        const symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([210, 105, 30, 0.5]), 8), new Color([210, 105, 30, 0.9]));

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


        this.props.view.graphics.remove(this.state.graphic);
        this.props.view.graphics.add(graphic);
        this.setState({ graphic });

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