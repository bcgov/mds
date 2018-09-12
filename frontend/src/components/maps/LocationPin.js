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
    loadModules(['esri/Graphic', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', "dojo/_base/Color"])
      .then(([Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color]) => {
        const symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([188, 41, 41]), 5), new Color([188, 41, 41]));

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