import React, { Component } from "react";
import L from "leaflet";
import PropTypes from "prop-types";

import "leaflet.markercluster";
// import "leaflet/dist/leaflet.css";
// import "leaflet.markercluster/dist/MarkerCluster.css";
// import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import * as Strings from "@mds/common/constants/strings";
import { Validate } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { SMALL_PIN } from "@/constants/assets";

/**
 * @class LeafletMap.js is a Leaflet Map component.
 */

const propTypes = {
  mine: CustomPropTypes.mine,
  additionalPins: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  controls: PropTypes.bool,
};

const defaultProps = {
  mine: undefined,
  additionalPins: [],
  controls: true,
};

class LeafletMap extends Component {
  // if mine does not have a location, set a default to center the map
  latLong =
    this.props.mine &&
      this.props.mine.mine_location &&
      this.props.mine.mine_location.latitude &&
      this.props.mine.mine_location.longitude
      ? // only add mine Pin if location exists
      [this.props.mine.mine_location.latitude, this.props.mine.mine_location.longitude]
      : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  componentDidMount() {
    // Create the base map with layers
    this.createMap();
    if (
      this.props.mine &&
      this.props.mine.mine_location &&
      this.props.mine.mine_location.latitude &&
      this.props.mine.mine_location.longitude
    ) {
      this.createPin();
    }
    if (this.props.additionalPins.length > 0) {
      this.createAdditionalPins(this.props.additionalPins);
    }
    this.fitBounds();
    if (!this.props.controls) {
      this.disableControls();
    }
  }

  checkValidityOfCoordinateInput = (coordinate) =>
    coordinate.length === 2 && Validate.checkLat(coordinate[0]) && Validate.checkLon(coordinate[1]);

  createPin() {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [32, 32],
    });
    L.marker(this.latLong, { icon: customIcon }).addTo(this.layerGroup);
  }

  createAdditionalPins(pins) {
    pins
      .filter((pin) => this.checkValidityOfCoordinateInput(pin))
      .map((pin) => {
        const customIcon = L.icon({
          iconUrl: SMALL_PIN,
          iconSize: [32, 32],
        });
        L.marker(pin, { icon: customIcon }).addTo(this.layerGroup);
      });
    this.fitBounds();
  }

  fitBounds() {
    this.map.invalidateSize();
    const bounds = this.layerGroup.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    if (sw && ne) {
      this.map.fitBounds([
        [sw.wrap().lat, sw.wrap().lng],
        [ne.wrap().lat, ne.wrap().lng],
      ]);
    }
  }

  createMap() {
    this.map = L.map("leaflet-map", { attributionControl: false, zoomControl: this.props.controls })
      .setView(this.latLong, Strings.DEFAULT_ZOOM)
      .setMaxZoom(10);
    this.layerGroup = new L.FeatureGroup().addTo(this.map);
    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    );
    // Add default basemap to the map
    topographicBasemap.addTo(this.map);
  }

  disableControls() {
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
  }

  render() {
    return <div style={{ height: "100%", width: "100%", zIndex: 0 }} id="leaflet-map" />;
  }
}

LeafletMap.propTypes = propTypes;
LeafletMap.defaultProps = defaultProps;

export default LeafletMap;
