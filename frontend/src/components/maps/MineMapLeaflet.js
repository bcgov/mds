import React, { Component } from "react";
import { Map, TileLayer, WMSTileLayer } from "react-leaflet";

/**
 * @class MineMapLeaflet.js is an Leaflet <Map /> component.
 */

class MineMapLeaflet extends Component {
  state = {
    lat: 48.13707,
    lng: -122.489504,
    zoom: 8,
  };

  render() {
    return (
      <Map center={[this.state.lat, this.state.lng]} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <WMSTileLayer layers="ne:ne" url="https://demo.boundlessgeo.com/geoserver/ows" />
      </Map>
    );
  }
}

export default MineMapLeaflet;
