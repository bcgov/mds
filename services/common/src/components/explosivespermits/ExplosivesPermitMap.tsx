import React, { Component, FC, useEffect, useRef, useState } from "react";
import L, { Map } from "leaflet";
import LeafletWms from "leaflet.wms";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import * as Strings from "@mds/common/constants/strings";
import { Validate } from "@mds/common/redux/utils/Validate";
import { SMALL_PIN_SELECTED } from "@mds/common/constants/assets";

/**
 * @class ExplosivesPermitMap.js is a Leaflet Map component.
 */

const leafletWMSTiledOptions = {
  transparent: true,
  tiled: true,
  uppercase: true,
  format: "image/png",
  identify: false,
};

const checkValidityOfCoordinateInput = (coordinates) =>
  coordinates.length === 2 &&
  Validate.checkLat(coordinates[0]) &&
  Validate.checkLon(coordinates[1]);

const getMajorMinePermittedAreas = () => {
  const majorMinesSource = LeafletWms.source(
    "https://openmaps.gov.bc.ca/geo/pub/WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP/ows",
    { ...leafletWMSTiledOptions, identify: false }
  );
  return majorMinesSource.getLayer("pub:WHSE_MINERAL_TENURE.HSP_MJR_MINES_PERMTTD_AREAS_SP");
};

interface ExplosivesPermitMapProps {
  pin: [number, number];
}

const ExplosivesPermitMap: FC<ExplosivesPermitMapProps> = ({ pin = [] }) => {
  const [containsPin, setContainsPin] = useState<boolean>(false);
  const mapRef = useRef<Map | null>(null);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const pinRef = useRef<L.Marker | null>(null);

  const latLong = checkValidityOfCoordinateInput(pin)
    ? // only add mine Pin if location exists
      pin
    : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  const createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN_SELECTED,
      iconSize: [60, 60],
    });
    pin = L.marker(pin, { icon: customIcon });
    markerClusterGroupRef.current?.addLayer(pin);
    mapRef.current?.fitBounds(markerClusterGroupRef.current?.getBounds());
    markerClusterGroupRef.current?.zoomToShowLayer(pin);
    setContainsPin(true);
  };

  const createMap = () => {
    mapRef.current = L.map("leaflet-map", { attributionControl: false })
      .setView(latLong, Strings.DEFAULT_ZOOM)
      .setMaxZoom(12);
    const majorMinePermittedAreas = getMajorMinePermittedAreas();
    mapRef.current?.addLayer(majorMinePermittedAreas);

    markerClusterGroupRef.current = L.markerClusterGroup({
      animate: false,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    mapRef.current?.addLayer(markerClusterGroupRef.current);
  };

  const getBaseMaps = () => {
    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    );
    // Add default basemap to the map
    topographicBasemap.addTo(mapRef.current);

    const worldImageryLayer = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    );

    return {
      Topographic: topographicBasemap,
      "World Imagery": worldImageryLayer,
    };
  };

  useEffect(() => {
    // Create the base map with layers
    createMap();
    L.control.layers(getBaseMaps(), {}, { position: "topright" }).addTo(mapRef?.current);
  }, []);

  useEffect(() => {
    if (checkValidityOfCoordinateInput(pin)) {
      if (containsPin) {
        pinRef.current?.setLatLng(pin);
        mapRef.current?.fitBounds(markerClusterGroupRef.current?.getBounds());
      } else {
        setContainsPin(false);
        createPin();
      }
    }
  }, [pin, containsPin]);

  return (
    <div
      style={{ height: "200px", width: "100%", zIndex: 1, position: "inherit" }}
      id="leaflet-map"
    />
  );
};

export default ExplosivesPermitMap;
