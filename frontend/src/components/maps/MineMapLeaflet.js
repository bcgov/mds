import React, { Component } from "react";
import { Map, TileLayer, WMSTileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * @class MineMapLeaflet.js is an Leaflet <Map /> component.
 */

const { Overlay } = LayersControl;

class MineMapLeaflet extends Component {
  state = {
    lat: 49.50707,
    lng: -122.699504,
    zoom: 8,
  };

  render() {
    return (
      <Map
        center={[this.state.lat, this.state.lng]}
        zoom={this.state.zoom}
        style={{ width: "100%", height: "600px" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <LayersControl position="topleft">
          <Overlay name="First Nations Layer">
            <WMSTileLayer
              layers="WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP"
              transparent
              uppercase
              format="image/png"
              attribution="DataBC"
              url="https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov?"
            />
          </Overlay>
          <Overlay name="BC Mine Regions">
            <TileLayer
              url="https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_Mine_Regions4/MapServer/tile/{z}/{y}/{x}"
              transparent
              uppercase
              format="image/png"
              attribution="BC Data Warehouse"
            />
          </Overlay>
          <Overlay name="Coal leases">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3647"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Coal licences">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3646"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Mining Leases">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3644"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Mineral Claims">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3643"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Placer Leases">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3642"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Placer Claims">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3641"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Coal Licence Applications">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              styles="3638"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Crown Granted Mineral Claims">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_CROWN_GRANT_MIN_CLAIM_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Roads (DRA)">
            <WMSTileLayer
              layers="WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Forest Tenure Roads">
            <WMSTileLayer
              layers="	WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Contour Lines">
            <WMSTileLayer
              layers="WHSE_BASEMAPPING.NTS_BC_CONTOUR_LINES_125M"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Natural Resource Regions">
            <WMSTileLayer
              layers="WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
          <Overlay name="Indian Reserves ">
            <WMSTileLayer
              layers="WHSE_ADMIN_BOUNDARIES.ADM_INDIAN_RESERVES_BANDS_SP"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
            />
          </Overlay>
        </LayersControl>
      </Map>
    );
  }
}

export default MineMapLeaflet;
