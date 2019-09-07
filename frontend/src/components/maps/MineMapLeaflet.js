import React, { Component } from "react";
import { Map, TileLayer, WMSTileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * @class MineMapLeaflet.js is an Leaflet <Map /> component.
 */

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
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <WMSTileLayer
          layers="WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP"
          transparent
          format="image/png"
          url="https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov?"
        />
      </Map>
    );
  }
}

export default MineMapLeaflet;
