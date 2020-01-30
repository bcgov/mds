import React, { Component } from "react";
import L from "leaflet";
import PropTypes from "prop-types";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "vendor/leaflet/leaflet-measure/leaflet-measure.css";
import "vendor/leaflet/mouse-coordinates/leaflet.mousecoordinate";
import "vendor/leaflet/grouped-layer-control/leaflet.groupedlayercontrol.min";

import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";

/**
 * @class MineHeaderMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  additionalPin: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  additionalPin: [],
};

class MineHeaderMapLeaflet extends Component {
  state = { containsAdditionalPin: false };

  // if mine does not have a location, set a default to center the map
  latLong =
    this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude
      ? // only add mine Pin if location exists
        [this.props.mine.mine_location.latitude, this.props.mine.mine_location.longitude]
      : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  componentDidMount() {
    // Create the base map with layers
    this.createMap();
    if (this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude) {
      this.createPin();
    }
    // Add MinePins to the top of LayerList and add the LayerList widget
    L.control.layers(this.getBaseMaps(), {}, { position: "topright" }).addTo(this.map);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.additionalPin.length === 2 &&
      nextProps.additionalPin !== this.props.additionalPin
    ) {
      if (this.state.containsAdditionalPin) {
        this.x.setLatLng(nextProps.additionalPin);
      } else {
        this.createNewPin(nextProps.additionalPin);
      }
    }
  }

  getBaseMaps() {
    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    );
    // Add default basemap to the map
    topographicBasemap.addTo(this.map);

    const worldImageryLayer = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    );

    return {
      Topographic: topographicBasemap,
      "World Imagery": worldImageryLayer,
    };
  }

  createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });

    L.marker(this.latLong, { icon: customIcon }).addTo(this.map);
  };

  createNewPin(pin) {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN_SELECTED,
      iconSize: [60, 60],
    });
    this.x = L.marker(pin, { icon: customIcon, draggable: true }).addTo(this.layerGroup);
    this.setState({ containsAdditionalPin: true });
  }

  createMap() {
    this.map = L.map("leaflet-map", { attributionControl: false })
      .setView(this.latLong, Strings.DEFAULT_ZOOM)
      .setMaxZoom(10);
    this.layerGroup = new L.FeatureGroup().addTo(this.map);
  }

  render() {
    return <div style={{ height: "100%", width: "100%", zIndex: 0 }} id="leaflet-map" />;
  }
}

MineHeaderMapLeaflet.propTypes = propTypes;
MineHeaderMapLeaflet.defaultProps = defaultProps;

export default MineHeaderMapLeaflet;
