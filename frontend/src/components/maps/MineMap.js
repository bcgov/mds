import React, { Component } from "react";
import { Map, TileLayer, WMSTileLayer } from "react-leaflet";

class MineMap extends Component {
  state = {
    lat: 48.20707,
    lng: -123.489504,
    zoom: 5,
  };

  render() {
    return (
      <Map center={[this.state.lat, this.state.lng]} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <WMSTileLayer
          layers="WHSE_ADMIN_BOUNDARIES.PIP_CONSULTATION_AREAS_SP"
          url="https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov?"
        />
      </Map>
    );
  }
}

export default MineMap;
