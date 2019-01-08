import React, { Component } from "react";
import { loadModules } from "react-arcgis";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import MapPopup from "@/components/maps/MapPopup";
import { renderToString } from "react-dom/server";
import { getMines, getMineIds } from "@/selectors/mineSelectors";

/**
 * @class MinePin.js must be the child of arcGIS <Map /> or <Screen />,
 * MinePin is connected to redux to access/display all mines information - reusable on any view will display the correct state.
 *
 */

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  view: {},
};

export class MinePin extends Component {
  state = { graphic: null, isFullMap: false };

  popupTemplate(id) {
    const { mine_name } = this.props.mines[id];
    const content = renderToString(<MapPopup id={id} />);
    return {
      title: mine_name,
      content,
    };
  }

  points = (id) => {
    if (this.props.mines[id].mine_location[0]) {
      return {
        type: "point",
        longitude: this.props.mines[id].mine_location[0].longitude,
        latitude: this.props.mines[id].mine_location[0].latitude,
      };
    }
    return null;
  };

  componentWillMount() {
    const fclURL = `${window.location.origin}${
      process.env.BASE_PATH
    }/public/FlareClusterLayer/fcl/FlareClusterLayer_v4.js`;

    loadModules([
      "esri/symbols/SimpleMarkerSymbol",
      "esri/renderers/ClassBreaksRenderer",
      "esri/symbols/SimpleLineSymbol",
      "esri/geometry/SpatialReference",
      "esri/PopupTemplate",
      fclURL,
    ]).then(
      ([
        SimpleMarkerSymbol,
        ClassBreaksRenderer,
        SimpleLineSymbol,
        SpatialReference,
        PopupTemplate,
        FlareClusterLayer,
      ]) => {
        // create a new Graphic for every mine in the array or fetch the ID from the URL for a single mine.
        // data must be passed into this.points() and this.popupTemplate to associate the correct information with the correct lat/long.
        const { id } = this.props.match.params;
        let mineIds = [];
        if (id) {
          mineIds = [id];
          this.setState({ isFullMap: false });
        } else {
          this.setState({ isFullMap: true });
          mineIds = this.props.mineIds;
        }

        const defaultSym = {
          url: `${window.location.origin}${process.env.BASE_PATH}/public/small-pin.svg`,
          width: this.state.isFullMap ? "40" : "80",
          height: this.state.isFullMap ? "40" : "80",
          type: "picture-marker",
        };

        const renderer = new ClassBreaksRenderer({
          defaultSymbol: defaultSym,
        });
        renderer.field = "clusterCount";

        const smSymbol = new SimpleMarkerSymbol({
          size: 22,
          outline: new SimpleLineSymbol({ color: [0, 0, 0] }),
          color: [247, 54, 251, 1],
        });
        const mdSymbol = new SimpleMarkerSymbol({
          size: 24,
          outline: new SimpleLineSymbol({ color: [0, 0, 0] }),
          color: [183, 166, 252, 1],
        });
        const lgSymbol = new SimpleMarkerSymbol({
          size: 28,
          outline: new SimpleLineSymbol({ color: [0, 0, 0] }),
          color: [114, 192, 238, 1],
        });
        const xlSymbol = new SimpleMarkerSymbol({
          size: 32,
          outline: new SimpleLineSymbol({ color: [0, 0, 0] }),
          color: [173, 252, 74, 1],
        });

        renderer.addClassBreakInfo(0, 5, smSymbol);
        renderer.addClassBreakInfo(6, 120, mdSymbol);
        renderer.addClassBreakInfo(121, 1000, lgSymbol);
        renderer.addClassBreakInfo(1001, Infinity, xlSymbol);

        // set up a popup template
        const popupTemplate = new PopupTemplate({
          title: "{templateTitle}",
          content: "{templateContent}",
        });

        const fclData = mineIds.reduce((result, id) => {
          const point = this.points(id);
          if (!point) {
            return result;
          }
          const y = Number(point.latitude);
          const x = Number(point.longitude);
          const templateInfo = this.popupTemplate(id);
          result.push({
            y,
            x,
            templateTitle: templateInfo.title,
            templateContent: templateInfo.content,
          });
          return result;
        }, []);

        const options = {
          id: "flare-cluster-layer",
          clusterRenderer: renderer,
          singlePopupTemplate: popupTemplate,
          spatialReference: new SpatialReference({ wkid: 3005 }),
          clusterToScale: 200000,
          data: fclData,
        };

        const fcl = FlareClusterLayer.FlareClusterLayer(options);
        fcl.title = "Mine Pins";
        this.props.map.layers.remove(fcl);
        this.props.map.layers.add(fcl);
      }
    );
  }

  componentWillUnmount() {
    this.props.view.graphics.remove(this.state.graphic);
  }

  render() {
    return null;
  }
}

MinePin.propTypes = propTypes;
MinePin.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineIds: getMineIds(state),
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(MinePin)
);
