import React, { Component } from "react";
import L from "leaflet";
import LeafletWms from "leaflet.wms";
import scriptLoader from "react-async-script-loader";

import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "@/utils/leaflet-libs/mouse-coordinates/leaflet.mousecoordinate";

import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN } from "@/constants/assets";
import { ENVIRONMENT } from "@/constants/environment";
import LeafletPopup from "@/components/maps/LeafletPopup";

require("leaflet.markercluster");

/**
 * @class MineMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  isScriptLoaded: PropTypes.bool.isRequired,
  isScriptLoadSucceed: PropTypes.bool.isRequired,
  lat: PropTypes.number,
  long: PropTypes.number,
  zoom: PropTypes.number,
  minesBasicInfo: PropTypes.arrayOf(CustomPropTypes.mine),
  mineName: PropTypes.string,
  transformedMineTypes: CustomPropTypes.transformedMineTypes,
};

const defaultProps = {
  lat: Strings.DEFAULT_LAT,
  long: Strings.DEFAULT_LONG,
  zoom: Strings.DEFAULT_ZOOM,
  minesBasicInfo: [],
  mineName: "",
  transformedMineTypes: {},
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
};

const getFirstNationLayer = () => {
  const firstNationSource = LeafletWms.source(
    ENVIRONMENT.firstNationsLayerUrl,
    leafletWMSTiledOptions
  );
  return firstNationSource.getLayer("WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP");
};

// const overlayLayers = [
//   "Roads (DRA)",
//   "Forest Tenure Roads",
//   "Contour Lines",
//   "Natural Resources Regions",
//   "Coal Leases",
//   "Coal Licenses",
//   "Mining Leases",
//   "Mineral Claims",
//   "Placer Leases",
//   "Placer Claims",
//   "Coal Licence Applications",
//   "Crown Granted Mineral Claims",
//   "Indian Reserves",
//   "BC Mine Regions",
// ];

class MineMapLeaflet extends Component {
  state = {
    mapCreated: false,
  };

  componentDidMount() {
    this.asyncScriptStatusCheck();
  }

  asyncScriptStatusCheck = () => {
    if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed && !this.state.mapCreated) {
      this.initMap();
    } else {
      setTimeout(this.asyncScriptStatusCheck, 500);
    }
  };

  createPin = (mine) => {
    const customIcon = L.icon({ iconUrl: SMALL_PIN, iconSize: [60, 60] });

    // TODO: Check what happens if Lat/Long is invalid
    const latLong = [mine.mine_location.latitude, mine.mine_location.longitude];

    if (this.props.mineName === mine.mine_name) {
      L.circle(latLong, {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.25,
        radius: 500,
        stroke: false,
      }).addTo(this.map);
    }

    const marker = L.marker(latLong, { icon: customIcon }).bindPopup(Strings.LOADING);
    this.markerClusterGroup.addLayer(marker);
    marker.on("click", this.handleMinePinClick(mine));
  };

  handleMinePinClick = (mine) => (e) => {
    this.props.fetchMineRecordById(mine.mine_guid).then(() => {
      const commodityCodes = this.props.transformedMineTypes.mine_commodity_code.map(
        (code) => this.props.mineCommodityOptionsHash[code]
      );
      const popup = e.target.getPopup();
      popup.setContent(this.renderPopup(this.props.mines[mine.mine_guid], commodityCodes));
    });
  };

  initMap() {
    // Create the base map with layers
    this.createMap();
    this.setState({ mapCreated: true });

    // Once the WebMap is loaded, add the rest of Layers and tools
    this.webmap.on("load", () => {
      // Center map to provided Lat/Long and Zoom
      this.map.setView([this.props.lat, this.props.long], this.props.zoom);

      // Add Clustered MinePins
      this.markerClusterGroup = L.markerClusterGroup({ animate: false });
      this.props.minesBasicInfo.map(this.createPin);
      this.map.addLayer(this.markerClusterGroup);

      // Add the WebMap layers to the Layer control widget
      const overlayMaps = {};
      overlayMaps["Mine Pins"] = this.markerClusterGroup;
      this.webmap.layers.forEach((l) => {
        overlayMaps[l.title] = l.layer;
      });
      overlayMaps["First nations"] = getFirstNationLayer();
      L.control
        .layers({}, overlayMaps, {
          position: "topleft",
        })
        .addTo(this.map);

      // Add Mouse coordinate widget
      L.control.mouseCoordinate({ utm: true, position: "topright" }).addTo(this.map);

      // Add ScaleBar widget
      L.control.scale({ imperial: false }).addTo(this.map);
    });
  }

  createMap() {
    // Creates the base leaflet map object and overlays the ESRI WebMap on top
    this.map = L.map("leaflet-map").setMaxZoom(20);
    this.webmap = window.L.esri.webMap(ENVIRONMENT.mapPortalId, { map: this.map });
  }

  renderPopup = (mine, commodityCodes = []) => {
    return ReactDOMServer.renderToStaticMarkup(
      <LeafletPopup mine={mine} commodityCodes={commodityCodes} context={this.context} />
    );
  };

  render() {
    return <div style={{ height: "100vh", width: "100%", zIndex: 0 }} id="leaflet-map" />;
  }
}

MineMapLeaflet.propTypes = propTypes;
MineMapLeaflet.defaultProps = defaultProps;

export default scriptLoader(
  [],
  // Load Esri Leaflet from CDN
  "https://unpkg.com/esri-leaflet@2.3.0/dist/esri-leaflet.js",
  // Load Esri Leaflet Renderers from CDN
  "https://cdn.jsdelivr.net/leaflet.esri.renderers/2.0.2/esri-leaflet-renderers.js",
  // Load Leaflet Omnivore
  "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js",
  // Load L.esri.WebMap
  "https://cdn.jsdelivr.net/leaflet.esri.webmap/0.4.0/esri-leaflet-webmap.js"
)(MineMapLeaflet);
