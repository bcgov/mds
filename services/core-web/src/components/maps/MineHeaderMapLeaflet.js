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
import CustomPropTypes from "@/customPropTypes";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";

/**
 * @class MineHeaderMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  additionalPin: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  additionalPin: [],
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
  identify: false,
};

const getMajorMinePermittedAreas = () => {
  const majorMinesSource = LeafletWms.source(
    "https://openmaps.gov.bc.ca/geo/pub/WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP/ows",
    { ...leafletWMSTiledOptions, identify: false }
  );
  return majorMinesSource.getLayer("pub:WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP");
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

    if (this.checkValidityOfCoordinateInput(this.props.additionalPin)) {
      this.createAdditionalPin(this.props.additionalPin);
    }

    // Add MinePins to the top of LayerList and add the LayerList widget
    L.control.layers(this.getBaseMaps(), {}, { position: "topright" }).addTo(this.map);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.additionalPin !== this.props.additionalPin &&
      this.checkValidityOfCoordinateInput(nextProps.additionalPin)
    ) {
      if (this.state.containsAdditionalPin) {
        this.additionalPin.setLatLng(nextProps.additionalPin);
        this.map.fitBounds(this.markerClusterGroup.getBounds());
      } else {
        this.setState({ containsAdditionalPin: false });
        this.createAdditionalPin(nextProps.additionalPin);
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

  checkValidityOfCoordinateInput = (coordinates) =>
    coordinates.length === 2 &&
    Validate.checkLat(coordinates[0]) &&
    Validate.checkLon(coordinates[1]);

  createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });
    const marker = L.marker(this.latLong, { icon: customIcon });
    this.markerClusterGroup.addLayer(marker);
  };

  createAdditionalPin = (pin) => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN_SELECTED,
      iconSize: [60, 60],
    });
    this.additionalPin = L.marker(pin, { icon: customIcon });
    this.markerClusterGroup.addLayer(this.additionalPin);
    this.map.fitBounds(this.markerClusterGroup.getBounds());
    this.markerClusterGroup.zoomToShowLayer(this.additionalPin);
    this.setState({ containsAdditionalPin: true });
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
    return <div style={{ height: "100%", width: "100%", zIndex: 1 }} id="leaflet-map" />;
  }
}

MineHeaderMapLeaflet.propTypes = propTypes;
MineHeaderMapLeaflet.defaultProps = defaultProps;

export default MineHeaderMapLeaflet;
