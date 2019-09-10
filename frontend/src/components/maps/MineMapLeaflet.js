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
          <Overlay name="Mineral, Placer, and Coal">
            <WMSTileLayer
              layers="WHSE_MINERAL_TENURE.MTA_ACQUIRED_TENURE_SVW	"
              transparent
              uppercase
              format="image/png"
              attribution="OpenMaps"
              url="https://openmaps.gov.bc.ca/geo/pub/wms"
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
        </LayersControl>
      </Map>
    );
  }
}

export default MineMapLeaflet;
