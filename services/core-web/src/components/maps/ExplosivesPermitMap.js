import React, { Component } from "react";
import L from "leaflet";
import LeafletWms from "leaflet.wms";
import PropTypes from "prop-types";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import * as Strings from "@mds/common/constants/strings";
import { Validate } from "@common/utils/Validate";
import { SMALL_PIN_SELECTED } from "@/constants/assets";

/**
 * @class ExplosivesPermitMap.js is a Leaflet Map component.
 */

const propTypes = {
  pin: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  pin: [],
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
  identify: false,
};

const checkValidityOfCoordinateInput = (coordinates) =>
  coordinates.length === 2 &&
  Validate.checkLat(coordinates[0]) &&
  Validate.checkLon(coordinates[1]);

const getMajorMinePermittedAreas = () => {
  const majorMinesSource = LeafletWms.source(
    "https://openmaps.gov.bc.ca/geo/pub/WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP/ows",
    { ...leafletWMSTiledOptions, identify: false }
  );
  return majorMinesSource.getLayer("pub:WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP");
};

export class ExplosivesPermitMap extends Component {
  state = { containsPin: false };

  // if mine does not have a location, set a default to center the map
  latLong = checkValidityOfCoordinateInput(this.props.pin)
    ? // only add mine Pin if location exists
      this.props.pin
    : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  componentDidMount() {
    // Create the base map with layers
    this.createMap();

    // Add MinePins to the top of LayerList and add the LayerList widget
    L.control.layers(this.getBaseMaps(), {}, { position: "topright" }).addTo(this.map);
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.pin !== this.props.pin;
    if (locationChanged && checkValidityOfCoordinateInput(nextProps.pin)) {
      if (this.state.containsPin) {
        this.pin.setLatLng(nextProps.pin);
        this.map.fitBounds(this.markerClusterGroup.getBounds());
      } else {
        this.setState({ containsPin: false });
        this.createPin(nextProps.pin);
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

  createPin = (pin) => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN_SELECTED,
      iconSize: [60, 60],
    });
    this.pin = L.marker(pin, { icon: customIcon });
    this.markerClusterGroup.addLayer(this.pin);
    this.map.fitBounds(this.markerClusterGroup.getBounds());
    this.markerClusterGroup.zoomToShowLayer(this.pin);
    this.setState({ containsPin: true });
  };

  createMap() {
    this.map = L.map("leaflet-map", { attributionControl: false })
      .setView(this.latLong, Strings.DEFAULT_ZOOM)
      .setMaxZoom(12);
    const majorMinePermittedAreas = getMajorMinePermittedAreas();
    this.map.addLayer(majorMinePermittedAreas);

    this.markerClusterGroup = L.markerClusterGroup({
      animate: false,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    this.map.addLayer(this.markerClusterGroup);
  }

  render() {
    return (
      <div
        style={{ height: "200px", width: "100%", zIndex: 1, position: "inherit" }}
        id="leaflet-map"
      />
    );
  }
}

ExplosivesPermitMap.propTypes = propTypes;
ExplosivesPermitMap.defaultProps = defaultProps;

export default ExplosivesPermitMap;
