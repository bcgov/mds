import React, { Component } from "react";

import L from "leaflet";
import LeafletWms from "leaflet.wms";
import scriptLoader from "react-async-script-loader";

import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";
import "esri-leaflet/dist/esri-leaflet";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "vendor/leaflet/mouse-coordinates/leaflet.mousecoordinate";
import "vendor/leaflet/grouped-layer-control/leaflet.groupedlayercontrol.min";

import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";
import { ENVIRONMENT } from "@/constants/environment";
import LeafletPopup from "@/components/maps/LeafletPopup";

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

// Override global Leaflet.WMS Layer request to return data
// into an HTML format so that it renders properly in the iframe
// Disabling Eslint because this is an extension of an internal method
/* eslint-disable */
LeafletWms.Source = LeafletWms.Source.extend({
  getFeatureInfoParams(point, layers) {
    // Hook to generate parameters for WMS service GetFeatureInfo request
    let wmsParams;
    let overlay;
    if (this.options.untiled) {
      // Use existing overlay
      wmsParams = this._overlay.wmsParams;
    } else {
      // Create overlay instance to leverage updateWmsParams
      overlay = this.createOverlay(true);
      overlay.updateWmsParams(this._map);
      wmsParams = overlay.wmsParams;
      wmsParams.layers = layers.join(",");
    }
    const infoParams = {
      request: "GetFeatureInfo",
      info_format: "text/html",
      query_layers: layers.join(","),
      X: Math.round(point.x),
      Y: Math.round(point.y),
    };
    return L.extend({}, wmsParams, infoParams);
  },
});
/* eslint-enable */
const getFirstNationLayer = () => {
  const firstNationSource = LeafletWms.source(
    ENVIRONMENT.firstNationsLayerUrl,
    leafletWMSTiledOptions
  );
  return firstNationSource.getLayer("WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP");
};

const baseMapsArray = ["World Topographic Map", "World Imagery"];

const admininstrativeBoundariesLayerArray = [
  "BC Mine Regions",
  "Natural Resource Regions - WMS",
  "Land Status and Survey Parcels - PMBC",
  "Regional Districts - WMS",
  "Ministry of Transportation District Boundaries - WMS",
  "Municipality Boundaries",
];

const tenureLayerArray = [
  "Crown Granted Mineral Claims",
  "Coal Licence Applications",
  "Coal Leases",
  "Coal Licences",
  "Mining Leases",
  "Mineral Claims",
  "Placer Leases",
  "Placer Claims",
];

const roadLayerArray = ["Roads DRA", "Forest Tenure Roads"];

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
    const pin = this.props.mineName === mine.mine_name ? SMALL_PIN_SELECTED : SMALL_PIN;
    const customIcon = L.icon({ iconUrl: pin, iconSize: [60, 60] });

    // TODO: Check what happens if Lat/Long is invalid
    const latLong = [mine.mine_location.latitude, mine.mine_location.longitude];

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

  getLayerGroupFromList = (groupLayerList) => {
    const result = {};
    const layerList = this.webMap.layers;
    groupLayerList.forEach((groupLayer) => {
      layerList.forEach((layer) => {
        if (layer.title === groupLayer) {
          result[groupLayer] = layer.layer;
        }
      });
    });
    return result;
  };

  addLatLongCircle = () => {
    if (this.props.lat && this.props.long && !this.props.mineName) {
      L.circle([this.props.lat, this.props.long], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.25,
        radius: 500,
        stroke: false,
      }).addTo(this.map);
    }
  };

  initMap() {
    // Create the base map with layers
    this.createMap();
    this.setState({ mapCreated: true });

    // Once the WebMap is loaded, add the rest of Layers and tools
    this.webMap.on("load", () => {
      // Center map to provided Lat/Long and Zoom
      this.map.setView([this.props.lat, this.props.long], this.props.zoom);

      // Add Clustered MinePins
      this.markerClusterGroup = L.markerClusterGroup({ animate: false });
      this.props.minesBasicInfo.map(this.createPin);
      this.map.addLayer(this.markerClusterGroup);
      this.addLatLongCircle();

      // Add the WebMap layers to the Layer control widget
      const groupedOverlays = {
        "Base Maps": this.getLayerGroupFromList(baseMapsArray),
        "Mine Pins": {
          "Mine Pins": this.markerClusterGroup,
        },
        Roads: this.getLayerGroupFromList(roadLayerArray),
        "NTS Contour Lines": {
          "NTS Contour Lines": this.getLayerGroupFromList(["NTS Contour Lines"]),
        },
        "Administrative Boundaries": this.getLayerGroupFromList(
          admininstrativeBoundariesLayerArray
        ),
        "Mineral, Placer, and Coal Tenures": this.getLayerGroupFromList(tenureLayerArray),
        "First Nations": {
          "First Nations PIP Consultation Areas": getFirstNationLayer(),
          "Indian Reserves & Band Names": this.getLayerGroupFromList([
            "Indian Reserves & Band Names",
          ]),
        },
      };

      L.control
        .groupedLayers({}, groupedOverlays, { exclusiveGroups: ["Base Maps"] })
        .addTo(this.map);

      // Add Mouse coordinate widget
      L.control.mouseCoordinate({ utm: true, position: "topright" }).addTo(this.map);

      // Add ScaleBar widget
      L.control.scale({ imperial: false }).addTo(this.map);
    });
  }

  createMap() {
    // Creates the base leaflet map object and overlays the ESRI WebMap on top
    this.map = L.map("leaflet-map", { attributionControl: false }).setMaxZoom(20);
    this.webMap = window.L.esri.webMap(ENVIRONMENT.mapPortalId, { map: this.map });
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
  // Load Esri Leaflet
  "https://unpkg.com/esri-leaflet@2.3.0/dist/esri-leaflet.js",
  // Load Esri Leaflet Renderers
  "https://cdn.jsdelivr.net/leaflet.esri.renderers/2.0.2/esri-leaflet-renderers.js",
  // Load Leaflet Omnivore
  "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js",
  // Load Leaflet esri webMap
  `${process.env.BASE_PATH}/vendor/leaflet/esri-leaflet-webmap/esri-leaflet-webmap.js`
)(MineMapLeaflet);
