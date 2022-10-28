import React, { Component } from "react";
import L from "leaflet";
import LeafletWms from "leaflet.wms";
import scriptLoader from "react-async-script-loader";
import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "vendor/leaflet/leaflet-measure/leaflet-measure.css";
import "vendor/leaflet/mouse-coordinates/leaflet.mousecoordinate";
import "vendor/leaflet/grouped-layer-control/leaflet.groupedlayercontrol.min";
import { FIRST_NATIONS_LAYER_URL } from "@common/constants/environment";
import * as Strings from "@common/constants/strings";
import { Descriptions } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";
import {
  baseMapsArray,
  admininstrativeBoundariesLayerArray,
  roadLayerArray,
  tenureLayerArray,
  tenureLayerStyles,
} from "@/constants/MapLayers";

/**
 * @class MineMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  consequenceClassificationStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {};

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
      X: point.x,
      Y: point.y,
    };
    return L.extend({}, wmsParams, infoParams);
  },
  parseFeatureInfo: function(result, url) {
    // Hook to handle parsing AJAX response
    if (result == "error") {
      // AJAX failed, possibly due to CORS issues.
      // Try loading content in <iframe>.
      result = "<iframe src='" + url + "' style='width:380px'>";
    }
    return result;
  },
  showFeatureInfo: function(latlng, info) {
    // Hook to handle displaying parsed AJAX response to the user
    if (!this._map) {
      return;
    }
    this._map.openPopup(info, latlng, { className: "leaflet-wms-popup" });
  },
});

const getFirstNationLayer = () => {
  const firstNationSource = LeafletWms.source(FIRST_NATIONS_LAYER_URL, leafletWMSTiledOptions);
  return firstNationSource.getLayer("WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP");
};

const getMajorMinePermittedAreas = () => {
  const majorMinesSource = LeafletWms.source(
    "https://openmaps.gov.bc.ca/geo/pub/WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP/ows",
    { ...leafletWMSTiledOptions, identify: false }
  );
  return majorMinesSource.getLayer("pub:WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP");
};

export class MineTailingsMap extends Component {
  state = {
    currentMarker: null,
  };

  latLong =
    this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude
      ? // only add mine Pin if location exists
        [this.props.mine.mine_location.latitude, this.props.mine.mine_location.longitude]
      : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  componentDidMount() {
    // Create the basic leaflet map
    this.map = L.map("leaflet-map", {
      attributionControl: false,
      center: this.latLong,
      zoom: Strings.DEFAULT_ZOOM,
      worldCopyJump: true,
      zoomAnimationThreshold: 8,
      minZoom: 4,
    });

    if (this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude) {
      this.createPin();
    }
    // Add Topographic BaseMap by default
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    ).addTo(this.map);

    // Load external leaflet libraries for WebMap and Widgets
    this.asyncScriptStatusCheck();

    // Add MinePin clusters
    this.addMinePinClusters();
  }

  createTailingsPin = (tailing) => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN_SELECTED,
      iconSize: [60, 60],
    });
    const marker = L.marker([tailing.latitude, tailing.longitude]).bindPopup(Strings.LOADING);
    const icon = customIcon;
    marker.setIcon(icon);

    this.markerClusterGroup.addLayer(marker);
    marker.on("click", this.handleTailingsPopup(tailing));
  };

  asyncScriptStatusCheck = () => {
    if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed) {
      // Add the widgets and the WebMap once the external libraries are loaded
      this.addWidgets();
      this.initWebMap();
    } else {
      setTimeout(this.asyncScriptStatusCheck, 200);
    }
  };

  createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });
    const marker = L.marker(this.latLong, { icon: customIcon });
    this.map.addLayer(marker);
  };

  handleTailingsPopup = (tailing) => (e) => {
    const popup = e.target.getPopup();
    popup.setContent(this.renderPopup(tailing));
  };

  addMinePinClusters = () => {
    this.markerClusterGroup = L.markerClusterGroup({ animate: false });
    this.props.tailings
      .filter(({ latitude, longitude }) => latitude && longitude)
      .map(this.createTailingsPin);
    this.map.addLayer(this.markerClusterGroup);
  };

  addWidgets = () => {
    // Add Mouse coordinate widget
    L.control.mouseCoordinate({ utm: true, position: "topright" }).addTo(this.map);

    // Add ScaleBar widget
    L.control.scale({ imperial: false }).addTo(this.map);

    // Add Measure widget
    const measureControl = new L.Control.Measure({
      position: "topright",
      primaryLengthUnit: "kilometers",
      activeColor: "#3c3636",
      completedColor: "#5e46a1",
    });
    measureControl.addTo(this.map);
  };

  addWebMapLayers = () => {
    const majorMinePermittedAreas = getMajorMinePermittedAreas();
    this.map.addLayer(majorMinePermittedAreas);
    const groupedOverlays = {
      Mines: {
        "Major Mine Permitted Areas": majorMinePermittedAreas,
        TSF: this.markerClusterGroup,
      },
      Roads: this.getLayerGroupFromList(roadLayerArray),
      "Natural Features": {
        "NTS Contour Lines": this.getLayerGroupFromList(["NTS Contour Lines"]),
      },
      "Mineral, Placer, and Coal Tenures": this.getLayerGroupFromList(tenureLayerArray),
      "Administrative Boundaries": this.getLayerGroupFromList(admininstrativeBoundariesLayerArray),
      "First Nations": {
        "Indian Reserves and Band Names": this.getLayerGroupFromList([
          "Indian Reserves and Band Names",
        ]),
        "First Nations PIP Consultation Areas": getFirstNationLayer(),
      },
    };

    L.control
      .groupedLayers(this.getLayerGroupFromList(baseMapsArray), groupedOverlays)
      .addTo(this.map);
  };

  getLayerGroupFromList = (groupLayerList) => {
    const result = {};
    const layerList = this.webMap.layers;
    groupLayerList.forEach((groupLayer) => {
      layerList.forEach((layer) => {
        if (layer.title === groupLayer) {
          result[groupLayer] = layer.layer;

          if (tenureLayerArray.includes(layer.title)) {
            const subLayers = layer.layer._layers;

            for (const layerID in subLayers) {
              let flLayer = subLayers[layerID];
              flLayer = Object.create(flLayer);

              flLayer.__proto__.setStyle(function(feature) {
                return tenureLayerStyles[layer.title];
              });
            }
          }
        }
      });
    });
    return result;
  };

  initWebMap() {
    // Fetch the WebMap
    this.webMap = window.L.esri.webMap("803130a9bebb4035b3ac671aafab12d7", { map: this.map });

    // Once the WebMap is loaded, add the rest of Layers and tools
    this.webMap.on("load", () => {
      // Add the WebMap layers and the Layer control widget
      this.addWebMapLayers();
      this.map.setView(this.latLong, Strings.DEFAULT_ZOOM);
    });
  }

  renderPopup = (tailing) => {
    return ReactDOMServer.renderToStaticMarkup(
      <Descriptions column={1} style={{ width: "320px" }}>
        <Descriptions.Item label="TSF Name">
          {tailing.mine_tailings_storage_facility_name || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Consequence Classification">
          {this.props.consequenceClassificationStatusCodeHash[
            tailing.consequence_classification_status_code
          ] || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Operating Status">
          {this.props.TSFOperatingStatusCodeHash[tailing.tsf_operating_status_code] ||
            Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Latitude">
          {tailing.latitude || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Longitude">
          {tailing.longitude || Strings.EMPTY_FIELD}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  render() {
    return (
      <div
        style={{ height: "80vh", width: "100%", zIndex: 1, position: "inherit" }}
        id="leaflet-map"
      />
    );
  }
}

MineTailingsMap.propTypes = propTypes;
MineTailingsMap.defaultProps = defaultProps;

export default scriptLoader(
  [],
  // Load Esri Leaflet
  "https://unpkg.com/esri-leaflet@2.3.0/dist/esri-leaflet.js",
  // Load Esri Leaflet Renderers
  "https://cdn.jsdelivr.net/leaflet.esri.renderers/2.0.2/esri-leaflet-renderers.js",
  // Load Leaflet Omnivore
  "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js",
  // Load Leaflet esri webMap
  `${process.env.BASE_PATH}/vendor/leaflet/esri-leaflet-webmap/esri-leaflet-webmap.js`,
  // Load Leaflet measure
  `${process.env.BASE_PATH}/vendor/leaflet/leaflet-measure/leaflet-measure.en.js`
)(MineTailingsMap);
