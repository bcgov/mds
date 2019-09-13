import React, { Component } from "react";
import L from "leaflet";
import leafletWms from "leaflet.wms";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN } from "@/constants/assets";

/**
 * @class MineMapLeaflet.js is a Leaflet Map component.
 *
 * TODO: Style the results using
 * https://stackoverflow.com/questions/46268753/filter-getfeatureinfo-results-leaflet-wms-plugin
 */

const propTypes = {
  lat: PropTypes.number,
  long: PropTypes.number,
  zoom: PropTypes.number,
  mines: PropTypes.arrayOf(CustomPropTypes.mine),
};

const defaultProps = {
  lat: Strings.DEFAULT_LAT,
  long: Strings.DEFAULT_LONG,
  zoom: Strings.DEFAULT_ZOOM,
  mines: [],
};

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
};

const getFirstNationLayer = () => {
  const firstNationSource = leafletWms.source(
    "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov?",
    leafletWMSTiledOptions
  );
  return firstNationSource.getLayer("WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP");
};

const getBcMineRegionLayer = () =>
  L.tileLayer(
    "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_Mine_Regions4/MapServer/tile/{z}/{y}/{x}",
    leafletWMSTiledOptions
  );

const getOpenMapsLayer = (styles = null, layer = "WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW") => {
  const sourceOptions = Object.assign({}, leafletWMSTiledOptions);

  if (styles !== null) {
    sourceOptions.styles = styles;
  }

  const openMapsSource = leafletWms.source("https://openmaps.gov.bc.ca/geo/pub/wms", sourceOptions);
  return openMapsSource.getLayer(layer);
};

const overlayLayers = {
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
    this.createMap();
    // FIXME: Taking a slice for performance
    this.props.mines.slice(0, 15).map(this.createPin);
  }

  getBaseMaps() {
    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
      }
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

  createPin = (mine) => {
    const customicon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });
    L.marker([mine.mine_location.latitude, mine.mine_location.longitude], { icon: customicon })
      .addTo(this.map)
      .bindPopup(this.renderPopup(mine));
  };

  createMap() {
    this.map = L.map("leaflet-map").setView([this.props.lat, this.props.long], this.props.zoom);
    L.control.layers(this.getBaseMaps(), overlayLayers, { position: "topleft" }).addTo(this.map);
  }

  renderPopup = (mine) => {
    return `<div><strong>Mine No.</strong> ${mine.mine_name} </div>
            <div><strong>Permit No.</strong></div>
            <div><strong>Commidities</strong></div>
           `;
  };

  render() {
    return <div style={{ height: "100vh", width: "100%" }} id="leaflet-map" />;
  }
}

MineMapLeaflet.propTypes = propTypes;
MineMapLeaflet.defaultProps = defaultProps;
export default MineMapLeaflet;
