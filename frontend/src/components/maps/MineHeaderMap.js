import React, { Component } from "react";
import { notification } from "antd";
import { Map, loadModules } from "react-arcgis";
import PropTypes from "prop-types";
import MinePin from "./MinePin";
import LocationPin from "./LocationPin";
import * as String from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineHeaderMap.js  is an arcGIS <Map /> component,
 * NOTE:: coordinates are in [long, lat] format.
 * MineHeaderMap.js is located on the Mine Summary page.
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

class MineHeaderMap extends Component {
  state = {
    view: {},
    center: null,
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
   * handleLoadMap creates an instance of map and view to keep in state for later use, map and view
   * are implicitly passed into any children of <Map>
   * Adds widgets and any other view modifications after map has been loaded
   */
  handleLoadMap = (map, view) => {
    this.renderBasemapToggle(view);
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
  };

  /**
   * Add the basemap toggle to the mine map on the mine dashboard
   * @param {MapView} view
   */
  renderBasemapToggle = async (view) => {
    await loadModules(["esri/widgets/BasemapToggle"]).then(([BasemapToggle]) => {
      const toggle = new BasemapToggle({
        view,
        nextBasemap: "satellite",
      });
      view.ui.add(toggle, "top-right");
    });
  };

  renderPin() {
    if (this.state.center) {
      return <LocationPin center={this.state.center} />;
    }
    return <div />;
  }

  render() {
    // default to the center of BC and change zoom level if mine location does not exist.
    // The 0.0000001 that is added to lat and long prevents the pin from dissapearing on the
    // mine page map under certain zooms.  it string concatinates added precision to the string eg (-113.0830000
    // becomes -113.08300001). This seems to be a bug with react-argis or some other library
    let centerOfMap = [String.DEFAULT_LONG, String.DEFAULT_LAT];
    if (this.props.mine.mine_location) {
      centerOfMap = [
        this.props.mine.mine_location.longitude
          ? parseFloat(this.props.mine.mine_location.longitude) + 0.0000001
          : String.DEFAULT_LONG,
        this.props.mine.mine_location.latitude
          ? parseFloat(this.props.mine.mine_location.latitude) + 0.0000001
          : String.DEFAULT_LAT,
      ];
    }
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
        onFail={this.handleFail}
      >
        <MinePin />
      </Map>
    );
  }
}

MineHeaderMap.propTypes = propTypes;
MineHeaderMap.defaultProps = defaultProps;
export default MineHeaderMap;
