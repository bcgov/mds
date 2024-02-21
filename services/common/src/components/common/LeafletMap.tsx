import React, { FC, useEffect, useState } from "react";
import L, { Map, LayerGroup, Marker } from "leaflet";

import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import * as Strings from "@mds/common/constants/strings";
import { IMine } from "../..";
import { Validate } from "@mds/common/redux/utils/Validate";
import { SMALL_PIN } from "@mds/common/constants/assets";

/**
 * @React.FC LeafletMap.tsx is a Leaflet Map component.
 */

interface LeafletMapProps {
  mine?: IMine;
  additionalPins?: string[][];
  controls?: boolean;
}

const LeafletMap: FC<LeafletMapProps> = ({ mine, additionalPins = [], controls = true }) => {
  // if mine does not have a location, set a default to center the map
  const hasMineLocation = mine?.mine_location?.latitude && mine?.mine_location?.longitude;
  const latLong = hasMineLocation
    ? // only add mine Pin if location exists
      [mine.mine_location.latitude, mine.mine_location.longitude]
    : [Number(Strings.DEFAULT_LAT), Number(Strings.DEFAULT_LONG)];

  const [map, setMap] = useState<Map>();
  const [layerGroup, setLayerGroup] = useState<LayerGroup>();
  const [placedPins, setPlacedPins] = useState<Array<Marker>>([]);

  const checkValidityOfCoordinateInput = (coordinate) =>
    coordinate.length === 2 && Validate.checkLat(coordinate[0]) && Validate.checkLon(coordinate[1]);

  const createPin = () => {
    const customIcon = L.icon({
      iconUrl: SMALL_PIN,
      iconSize: [32, 32],
    });
    L.marker(latLong, { icon: customIcon }).addTo(layerGroup);
  };

  const fitBounds = () => {
    if (map && layerGroup) {
      map.invalidateSize();

      // including latLong with no mine (ie default values)
      // will always include "center of BC" and may not be centered around pin(s)
      const allPins = [latLong, ...additionalPins];
      const latVals = allPins.filter((pin) => pin[0] !== null).map((pin) => Number(pin[0]));
      const lngVals = allPins.filter((pin) => pin[1] !== null).map((pin) => Number(pin[1]));

      if (latVals.length && lngVals.length) {
        const maxLat = Math.max(...latVals);
        const minLat = Math.min(...latVals);

        const maxLng = Math.max(...lngVals);
        const minLng = Math.min(...lngVals);

        // lat: higher is n, lower is s
        // lng: higher is e, lower is w
        const bounds = [
          [maxLat, minLng],
          [minLat, maxLng],
        ];
        if (
          checkValidityOfCoordinateInput(bounds[0]) &&
          checkValidityOfCoordinateInput(bounds[1])
        ) {
          map.fitBounds(bounds);
        }
      }
    }
  };

  const createAdditionalPins = (pins) => {
    const validPins = pins.filter((pin) => checkValidityOfCoordinateInput(pin));

    const markers = validPins.map((pin) => {
      const customIcon = L.icon({
        iconUrl: SMALL_PIN,
        iconSize: [32, 32],
      });
      return L.marker(pin, { icon: customIcon }).addTo(layerGroup);
    });
    setPlacedPins(markers);
    fitBounds();
  };

  const createMap = () => {
    const newMap = L.map("leaflet-map", { attributionControl: false, zoomControl: controls })
      .setView(latLong, Strings.DEFAULT_ZOOM)
      .setMaxZoom(10);

    const newLayerGroup = new L.FeatureGroup().addTo(newMap);

    const topographicBasemap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    );
    // Add default basemap to the map
    topographicBasemap.addTo(newMap);
    setMap(newMap);
    setLayerGroup(newLayerGroup);
  };

  const disableControls = () => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
  };

  useEffect(() => {
    createMap();
    if (hasMineLocation) {
      createPin();
    }
    fitBounds();
    if (!controls) {
      disableControls();
    }
  }, []);

  useEffect(() => {
    if (additionalPins.length > 0) {
      placedPins.forEach((pin) => {
        const { lat, lng } = pin.getLatLng();
        const comparableValue = [lat.toString(), lng.toString()];
        if (!additionalPins.includes(comparableValue)) {
          pin.remove();
        }
      });
      createAdditionalPins(additionalPins);
    }
  }, [additionalPins]);

  return <div style={{ height: "100%", width: "100%", zIndex: 0 }} id="leaflet-map" />;
};

export default LeafletMap;
