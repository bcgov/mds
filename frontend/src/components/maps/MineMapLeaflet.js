import React, { Component } from "react";

import L from "leaflet";
import LeafletWms from "leaflet.wms";
import * as EsriLeaflet from "esri-leaflet";
import "@/utils/leaflet-libs/mouse-coordinates/leaflet.mousecoordinate";

import ReactDOMServer from "react-dom/server";
import PropTypes from "prop-types";
import LeafletPopup from "@/components/maps/LeafletPopup";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN } from "@/constants/assets";

require("leaflet.markercluster");

/**
 * @class MineMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  lat: PropTypes.number,
  long: PropTypes.number,
  zoom: PropTypes.number,
  minesBasicInfo: PropTypes.arrayOf(CustomPropTypes.mine),
  mineName: PropTypes.string,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  lat: Strings.DEFAULT_LAT,
  long: Strings.DEFAULT_LONG,
  zoom: Strings.DEFAULT_ZOOM,
  minesBasicInfo: [],
  mineName: "",
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
};

// Override global Leaflet.WMS Layer request to return data
// into an HTML format so that it renders properly in the iframe
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

const getFirstNationLayer = () => {
  const firstNationSource = LeafletWms.source(
    "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov?",
    leafletWMSTiledOptions
  );
  return firstNationSource.getLayer("WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP");
};

const getBcMineRegionLayer = () =>
  EsriLeaflet.tiledMapLayer({
    url:
      "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_Mine_Regions4/MapServer",
  });

const getOpenMapsLayer = (styles = null, layer = "WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW") => {
  const sourceOptions = Object.assign({}, leafletWMSTiledOptions);

  if (styles !== null) {
    sourceOptions.styles = styles;
  }

  const openMapsSource = LeafletWms.source("https://openmaps.gov.bc.ca/geo/pub/wms", sourceOptions);
  return openMapsSource.getLayer(layer);
};

let overlayLayers = {
  "Roads (DRA)": getOpenMapsLayer(null, "WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP"),
  "Forest Tenure Roads": getOpenMapsLayer(null, "WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW"),
  "Contour Lines": getOpenMapsLayer(null, "WHSE_BASEMAPPING.NTS_BC_CONTOUR_LINES_125M"),
  "Natural Resources Regions": getOpenMapsLayer(null, "WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG"),
  "Coal Leases": getOpenMapsLayer(3647),
  "Coal Licenses": getOpenMapsLayer(3646),
  "Mining Leases": getOpenMapsLayer(3644),
  "Mineral Claims": getOpenMapsLayer(3643),
  "Placer Leases": getOpenMapsLayer(3642),
  "Placer Claims": getOpenMapsLayer(3641),
  "Coal Licence Applications": getOpenMapsLayer(3638),
  "Crown Granted Mineral Claims": getOpenMapsLayer(
    null,
    "WHSE_MINERAL_TENURE.MTA_CROWN_GRANT_MIN_CLAIM_SVW"
  ),
  "Indian Reserves": getOpenMapsLayer(null, "WHSE_ADMIN_BOUNDARIES.ADM_INDIAN_RESERVES_BANDS_SP"),
  "BC Mine Regions": getBcMineRegionLayer(),
  "First Nations PIP Consultation Areas": getFirstNationLayer(),
};

class MineMapLeaflet extends Component {
  componentDidMount() {
    // Create the base map with layers
    this.createMap();

    // Add Clustered MinePins
    this.markerClusterGroup = L.markerClusterGroup({
      animate: false,
    });
    this.props.minesBasicInfo.map(this.createPin);
    this.map.addLayer(this.markerClusterGroup);

    // Add MinePins to the top of LayerList and add the LayerList widget
    overlayLayers = Object.assign({ "Mine Pins": this.markerClusterGroup }, overlayLayers);
    L.control.layers(this.getBaseMaps(), overlayLayers, { position: "topleft" }).addTo(this.map);

    // Add Mouse coordinate widget
    L.control.mouseCoordinate({ utm: true, position: "topright" }).addTo(this.map);
    // Add ScaleBar widget
    L.control.scale({ imperial: false }).addTo(this.map);
  }

  getBaseMaps() {
    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Esri",
      }
    );
    // Add default basemap to the map
    topographicBasemap.addTo(this.map);

    const worldImageryLayer = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Esri",
      }
    );

    return {
      Topographic: topographicBasemap,
      "World Imagery": worldImageryLayer,
    };
  }

  createPin = (mine) => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });

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

  createMap() {
    this.map = L.map("leaflet-map")
      .setView([this.props.lat, this.props.long], this.props.zoom)
      .setMaxZoom(20);
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

export default MineMapLeaflet;
