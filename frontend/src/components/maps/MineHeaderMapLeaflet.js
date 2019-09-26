import React, { Component } from "react";
import L from "leaflet";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { SMALL_PIN } from "@/constants/assets";

/**
 * @class MineHeaderMapLeaflet.js is a Leaflet Map component.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

class MineHeaderMapLeaflet extends Component {
  latLong = [this.props.mine.mine_location.latitude, this.props.mine.mine_location.longitude];

  componentDidMount() {
    // Create the base map with layers
    this.createMap();
    this.createPin();

    // Add MinePins to the top of LayerList and add the LayerList widget
    L.control.layers(this.getBaseMaps(), {}, { position: "topleft" }).addTo(this.map);
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

  createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [60, 60],
    });

    L.marker(this.latLong, { icon: customIcon }).addTo(this.map);
  };

  createMap() {
    this.map = L.map("leaflet-map")
      .setView(this.latLong, Strings.HIGH_ZOOM)
      .setMaxZoom(20);
  }

  render() {
    return <div style={{ height: "100%", width: "100%", zIndex: 0 }} id="leaflet-map" />;
  }
}

MineHeaderMapLeaflet.propTypes = propTypes;
MineHeaderMapLeaflet.defaultProps = defaultProps;

export default MineHeaderMapLeaflet;
