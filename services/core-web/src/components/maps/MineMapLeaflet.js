// TODO: Remove this line when the file is more properly implemented.
/* eslint-disable */
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
import { FIRST_NATIONS_LAYER_URL } from "@mds/common";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";
import LeafletPopup from "@/components/maps/LeafletPopup";
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
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  isScriptLoaded: PropTypes.bool.isRequired,
  isScriptLoadSucceed: PropTypes.bool.isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  lat: PropTypes.number,
  long: PropTypes.number,
  zoom: PropTypes.number,
  minesBasicInfo: PropTypes.arrayOf(CustomPropTypes.mine),
  mineName: PropTypes.string,
  mineGuid: PropTypes.string,
};

const defaultProps = {
  lat: Strings.DEFAULT_LAT,
  long: Strings.DEFAULT_LONG,
  zoom: Strings.DEFAULT_ZOOM,
  minesBasicInfo: [],
  mineName: null,
  mineGuid: null,
  transformedMineTypes: {},
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
};

const SELECTED_ICON = L.icon({ iconUrl: SMALL_PIN_SELECTED, iconSize: [60, 60] });
const UNSELECTED_ICON = L.icon({ iconUrl: SMALL_PIN, iconSize: [60, 60] });

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

class MineMapLeaflet extends Component {
  state = {
    currentMarker: null,
  };

  componentDidMount() {
    // Create the basic leaflet map
    this.map = L.map("leaflet-map", {
      attributionControl: false,
      center: [this.props.lat, this.props.long],
      zoom: this.props.zoom,
      worldCopyJump: true,
      zoomAnimationThreshold: 8,
      minZoom: 4,
    });

    // Add Topographic BaseMap by default
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    ).addTo(this.map);

    // Load external leaflet libraries for WebMap and Widgets
    this.asyncScriptStatusCheck();

    // Add MinePin clusters
    this.addMinePinClusters();
  }

  asyncScriptStatusCheck = () => {
    if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed) {
      // Add the widgets and the WebMap once the external libraries are loaded
      this.addWidgets();
      this.initWebMap();
    } else {
      setTimeout(this.asyncScriptStatusCheck, 200);
    }
  };

  createPin = (mine) => {
    const marker = L.marker([mine.latitude, mine.longitude]).bindPopup(Strings.LOADING);

    let icon = UNSELECTED_ICON;
    if (this.props.mineGuid === mine.mine_guid) {
      icon = SELECTED_ICON;
      this.setState({ currentMarker: marker });
    }
    marker.setIcon(icon);

    this.markerClusterGroup.addLayer(marker);
    marker.on("click", this.handleMinePinClick(mine));
  };

  handleMinePinClick = (mine) => (e) => {
    this.props.fetchMineRecordById(mine.mine_guid).then(() => {
      if (this.state.currentMarker) {
        this.state.currentMarker.setIcon(UNSELECTED_ICON);
      }
      e.target.setIcon(SELECTED_ICON);
      this.setState({ currentMarker: e.target });

      const popup = e.target.getPopup();
      popup.setContent(
        this.renderPopup(this.props.mines[mine.mine_guid], this.props.transformedMineTypes)
      );
    });
  };

  addLatLongCircle = () => {
    if (!this.props.mineName && this.props.lat && this.props.long) {
      L.circle([this.props.lat, this.props.long], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.25,
        radius: 500,
        stroke: false,
      }).addTo(this.map);
    }
  };

  addMinePinClusters = () => {
    // Add Clustered MinePins
    this.markerClusterGroup = L.markerClusterGroup({ animate: false });
    this.props.minesBasicInfo.map(this.createPin);
    this.map.addLayer(this.markerClusterGroup);
    this.addLatLongCircle();
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
      primaryAreaUnit: "hectares",
    });
    measureControl.addTo(this.map);
  };

  addWebMapLayers = () => {
    const majorMinePermittedAreas = getMajorMinePermittedAreas();
    this.map.addLayer(majorMinePermittedAreas);
    const groupedOverlays = {
      Mines: {
        "Mine Pins": this.markerClusterGroup,
        "Major Mine Permitted Areas": majorMinePermittedAreas,
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

      // Esri WebMap resets the zoom level, zoom back to props coordinates after they're done loading
      const resetZoomCheckID = setInterval(() => {
        if (this.map.getZoom() !== this.props.zoom) {
          this.map.setView([this.props.lat, this.props.long], this.props.zoom, true);

          // Stop checking
          clearInterval(resetZoomCheckID);
        }
      }, 5);
    });
  }

  renderPopup = (mine, transformedMineTypes) => {
    return ReactDOMServer.renderToStaticMarkup(
      <LeafletPopup
        mine={mine}
        transformedMineTypes={transformedMineTypes}
        context={this.context}
        mineRegionHash={this.props.mineRegionHash}
        mineTenureHash={this.props.mineTenureHash}
        mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
        mineDisturbanceOptionsHash={this.props.mineDisturbanceOptionsHash}
      />
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
  `${process.env.BASE_PATH}/vendor/leaflet/esri-leaflet-webmap/esri-leaflet-webmap.js`,
  // Load Leaflet measure
  `${process.env.BASE_PATH}/vendor/leaflet/leaflet-measure/leaflet-measure.en.js`
)(MineMapLeaflet);
