import React, { Component } from "react";
import { notification } from "antd";
import { WebMap, Map, loadModules } from "react-arcgis";
import { ENVIRONMENT } from "@/constants/environment";
import PropTypes from "prop-types";
import MinePin from "./MinePin";
import LocationPin from "./LocationPin";
import * as String from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 * MineMap.js is located on Landing page as well as Mine Summary page.
 */
const propTypes = {
  mine: CustomPropTypes.mine,
  lat: PropTypes.number,
  long: PropTypes.number,
};

const defaultProps = {
  mine: null,
  lat: null,
  long: null,
};

class MineMap extends Component {
  state = {
    view: {},
    center: null,
    mapFailedToLoad: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.lat !== this.props.lat || nextProps.long !== this.props.long) {
      const center = [nextProps.long, nextProps.lat];
      this.setState((prevState) => {
        const newView = prevState.view;
        newView.center = center;
        newView.zoom = 10;
        return { view: newView, center };
      });
    }
  }

  /**
   * handleLoadMap creates an instance of map and view to keep in state for later use, map and view are implicitly passed into any children of <Map>
   * Adds widgets and any other view modifications after map has been loaded
   */
  handleLoadMap = (map, view) => {
    if (!this.props.mine) {
      this.renderWidgets(view);
    }
    this.setState({ view });
  };

  /**
   * handleFail displays a warning and loads a default base map with mine pins
   */
  handleFail = () => {
    notification.warn({
      message: String.MAP_UNAVAILABLE,
      duration: 10,
    });
    this.setState({ mapFailedToLoad: true });
  };

  renderPin() {
    if (this.state.center) {
      return <LocationPin center={this.state.center} />;
    }
    return <div />;
  }

  /**
   * Adds widgets to a given MapView instance
   * @param {MapView} view
   */
  renderWidgets = async (view) => {
    await loadModules([
      "esri/widgets/LayerList",
      "esri/widgets/Expand",
      "esri/widgets/ScaleBar",
      "esri/widgets/Legend",
      "esri/layers/GroupLayer",
      "esri/widgets/CoordinateConversion",
    ]).then(([LayerListWidget, Expand, ScaleBar, Legend, GroupLayer, CoordinateConversion]) => {
      const administrativeLayer = new GroupLayer({
        title: "Administrative Boundaries",
        visible: true,
      });
      const tenureLayer = new GroupLayer({
        title: "Mineral, Placer, and Coal",
        visible: true,
      });
      const roadsLayer = new GroupLayer({
        title: "Roads",
        visible: true,
      });

      const adminLayerArray = [
        "Indian Reserves & Band Names",
        "BC Mine Regions",
        "Natural Resource Regions",
        "Natural Resource Regions - WMS",
        "Land Status and Survey Parcels - PMBC",
        "Regional Districts - WMS",
        "Ministry of Transportation District Boundaries - WMS",
        "Municipality Boundaries",
      ];
      const tenureLayerArray = [
        "Coal Licence Applications",
        "Coal Leases",
        "Coal Licences",
        "Mining Leases",
        "Mineral Claims",
        "Placer Leases",
        "Placer Claims",
      ];
      const roadLayerArray = ["Roads DRA", "Forest Tenure Roads", "Roads (DRA)"];

      const addLayersToGroup = (layerNameArray, groupLayer) => {
        layerNameArray.forEach((layerTitle) => {
          const newTenureLayer = view.map.allLayers.find(({ title }) => title === layerTitle);
          if (newTenureLayer) {
            groupLayer.add(newTenureLayer);
          }
        });
      };
      addLayersToGroup(adminLayerArray, administrativeLayer);
      addLayersToGroup(tenureLayerArray, tenureLayer);
      addLayersToGroup(roadLayerArray, roadsLayer);

      const ntsContourLayer = view.map.allLayers.find(({ title }) => title === "NTS Contour Lines");
      const minePinLayer = view.map.allLayers.find(({ title }) => title === "Mine Pins");

      // Add the new group layers to the map (order added determines display order in widget).
      view.map.layers.add(administrativeLayer);
      view.map.layers.add(tenureLayer);
      view.map.layers.add(roadsLayer);
      // Fix the order of non grouped layers
      if (minePinLayer) {
        view.map.layers.reorder(minePinLayer, view.map.layers.length - 1);
      }
      if (ntsContourLayer) {
        view.map.layers.reorder(ntsContourLayer, view.map.layers.length - 3);
      }

      const widgetPositionArray = {};

      widgetPositionArray["top-right"] = new CoordinateConversion({
        view,
      });

      // set DD to default:
      const ddFormat = widgetPositionArray["top-right"].formats.find(({ name }) => name === "dd");
      if (ddFormat) {
        widgetPositionArray["top-right"].formats.reorder(ddFormat, 0);
      }

      // Remove the xy conversion from the widget
      const conversionToChange = widgetPositionArray["top-right"].conversions.find(
        (conversion) => conversion.format.name === "xy"
      );
      if (conversionToChange) {
        conversionToChange.format = ddFormat;
      }

      const formatsToRemove = ["basemap", "xy", "usng", "mgrs"];
      formatsToRemove.forEach((formatName) => {
        const formatToRemove = widgetPositionArray["top-right"].formats.find(
          ({ name }) => name === formatName
        );
        if (formatToRemove) {
          widgetPositionArray["top-right"].formats.remove(formatToRemove);
        }
      });

      widgetPositionArray["top-left"] = new LayerListWidget({
        view,
        container: document.createElement("layer_list"),
      });

      widgetPositionArray["bottom-left"] = new Legend({
        view,
        container: document.createElement("legend"),
      });

      Object.keys(widgetPositionArray).forEach((position) => {
        // Cast all the widgets under an expandable div and add them to the UI
        const currentWidget = new Expand({
          view,
          content: widgetPositionArray[position],
        });
        view.ui.add(currentWidget, position);
      });

      const scaleBar = new ScaleBar({
        view,
        container: document.createElement("scale_bar"),
        unit: "metric",
      });
      view.ui.add(scaleBar, "bottom-right");
    });
  };

  render() {
    if (this.props.mine) {
      // default to the center of BC and change zoom level if mine location does not exist.
      // The 0.0000001 that is added to lat and long prevents the pin from dissapearing on the
      // mine page map under certain zooms.  it string concatinates added precision to the string eg (-113.0830000
      // becomes -113.08300001). This seems to be a bug with react-argis or some other library
      const centerOfMap = [
        this.props.mine.mine_location
          ? parseFloat(this.props.mine.mine_location.longitude) + 0.0000001
          : String.DEFAULT_LONG,
        this.props.mine.mine_location
          ? parseFloat(this.props.mine.mine_location.latitude) + 0.0000001
          : String.DEFAULT_LAT,
      ];
      return (
        // Map located on MineSummary page, - this.props.mine is available, contains 1 mine pin.
        <Map
          style={{ width: "100%", height: "100%" }}
          mapProperties={{ basemap: "topo" }}
          viewProperties={{
            center: centerOfMap,
            zoom: this.props.mine.mine_location ? 8 : 5,
            constraints: { minZoom: 5 },
          }}
          onLoad={this.handleLoadMap}
        >
          <MinePin />
        </Map>
      );
    }
    if (this.state.mapFailedToLoad) {
      return (
        // Fallback to default map if any of the layers fail to load
        <Map
          style={{ width: "100%", height: "100vh" }}
          mapProperties={{ basemap: "topo" }}
          viewProperties={{
            center: [this.props.long, this.props.lat],
            zoom: 6,
            constraints: { minZoom: 5 },
          }}
          onLoad={this.handleLoadMap}
        >
          {this.renderPin()}
          <MinePin />
        </Map>
      );
    }
    return (
      // Map located on landing page - contains all mine pins and adds a location pin when searched.
      // this.props.lat & this.props.long get changed in Dashboard.js
      <WebMap
        id={ENVIRONMENT.mapPortalId}
        style={{ width: "100%", height: "100vh" }}
        mapProperties={{ basemap: "topo" }}
        viewProperties={{
          center: [this.props.long, this.props.lat],
          zoom: 6,
          constraints: { minZoom: 5 },
          popup: {
            dockOptions: {
              breakpoint: { width: 0, height: 0 },
            },
          },
        }}
        onLoad={this.handleLoadMap}
        onFail={this.handleFail}
      >
        {this.renderPin()}
        <MinePin />
      </WebMap>
    );
  }
}

MineMap.propTypes = propTypes;
MineMap.defaultProps = defaultProps;
export default MineMap;
