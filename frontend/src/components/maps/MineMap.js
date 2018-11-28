import React, { Component } from "react";
import { WebMap } from "react-arcgis";
import { loadModules } from "react-arcgis";
import PropTypes from "prop-types";
import MinePin from "./MinePin";
import LocationPin from "./LocationPin";
import * as String from "@/constants/strings";

/**
 * @class MineMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 * MineMap.js is located on Landing page as well as Mine Summary page.
 */
const propTypes = {
  mine: PropTypes.object,
  lat: PropTypes.number,
  long: PropTypes.number,
};

const defaultProps = {
  mine: null,
};

class MineMap extends Component {
  state = { map: null, view: null, center: null, zoom: null };

  componentWillReceiveProps(nextProps) {
    if (nextProps.lat != this.props.lat || nextProps.long != this.props.long) {
      const newView = this.state.view;
      const center = [nextProps.long, nextProps.lat];
      newView.center = center;
      newView.zoom = 10;
      this.setState({ view: newView, center });
    }
  }

  /**
   * handleLoadMap creates an instance of map and view to keep in state for later use, map and view are implicitly passed into any children of <Map>
   * Adds widgets and any other view modifications after map has been loaded
   */
  handleLoadMap = (map, view) => {
    this.renderWidgets(view);
    this.setState({ map, view });
  };

  renderPin() {
    if (this.state.center) {
      return <LocationPin center={this.state.center} />;
    } else {
      return <div />;
    }
  }

  /**
   * Adds widgets to a given MapView instance
   * @param {MapView} view
   */
  async renderWidgets(view) {
    await loadModules([
      "esri/widgets/LayerList",
      "esri/widgets/Expand",
      "esri/widgets/BasemapGallery",
    ]).then(([LayerListWidget, Expand, BasemapGallery]) => {
      const widgetPositionArray = {};

      const layerList = new LayerListWidget({
        view: view,
        container: document.createElement("layer_list"),
      });
      widgetPositionArray["top-left"] = layerList;

      const mapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("map_gallery"),
      });
      widgetPositionArray["top-right"] = mapGallery;

      for (const position in widgetPositionArray) {
        // Cast all the widgets under an expandable div and add them to the UI
        const currentWidget = new Expand({
          view: view,
          content: widgetPositionArray[position],
        });
        view.ui.add(currentWidget, position);
      }
    });
  }

  render() {
    if (this.props.mine) {
      const { mine } = this.props;
      return (
        // Map located on MineSummary page, - this.props.mine is available, contains 1 mine pin.
        // default to the center of BC and change zoom level if mine location does not exist.
        <WebMap
          style={{ width: "100%", height: "100%" }}
          mapProperties={{ basemap: "topo" }}
          viewProperties={{
            center: [
              mine.mine_location[0] ? mine.mine_location[0].longitude : String.DEFAULT_LONG,
              mine.mine_location[0] ? mine.mine_location[0].latitude : String.DEFAULT_LAT,
            ],
            zoom: mine.mine_location[0] ? 8 : 4,
          }}
          onLoad={this.handleLoadMap}
          onMouseWheel={(event) => event.stopPropagation()}
        >
          <MinePin />
        </WebMap>
      );
    }
    return (
      // Map located on landing page - contains all mine pins and adds a location pin when searched.
      // this.props.lat & this.props.long get changed in Dashboard.js
      <WebMap
        id={String.BASE_WEBMAP_ID}
        style={{ width: "100vw", height: "100vh" }}
        mapProperties={{ basemap: "topo" }}
        viewProperties={{
          center: [this.props.long, this.props.lat],
          zoom: 6,
        }}
        onLoad={this.handleLoadMap}
        onMouseWheel={(event) => event.stopPropagation()}
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
