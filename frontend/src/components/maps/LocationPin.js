import React, { Component } from "react";
import { loadModules } from "react-arcgis";
import PropTypes from "prop-types";

/**
 * @class LocationPin.js must be the child of arcGIS <Map /> or <Sceen />,
 *
 */
const propTypes = {
  center: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired,
};

const defaultProps = {
  view: {},
  map: {},
};

export class LocationPin extends Component {
  state = { graphic: null };

  componentWillMount() {
    this.renderGraphic(this.props.center);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.center !== this.props.center) {
      this.renderGraphic(nextProps.center);
    }
  }

  componentWillUnmount() {
    this.props.view.graphics.remove(this.state.graphic);
  }

  renderGraphic = (props) => {
    loadModules([
      "esri/Graphic",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",
      "dojo/_base/Color",
    ]).then(([Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color]) => {
      const symbol = new SimpleMarkerSymbol(
        SimpleMarkerSymbol.STYLE_CIRCLE,
        15,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([188, 41, 41]), 5),
        new Color([188, 41, 41])
      );

      const point = {
        type: "point",
        longitude: props[0],
        latitude: props[1],
      };

      const graphic = new Graphic({
        geometry: point,
        symbol,
      });

      this.props.view.graphics.remove(this.state.graphic);
      this.props.view.graphics.add(graphic);
      this.setState({ graphic });
    });
  };

  render() {
    return null;
  }
}

LocationPin.propTypes = propTypes;
LocationPin.defaultProps = defaultProps;

export default LocationPin;
