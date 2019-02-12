import React, { Component } from "react";
import { loadModules } from "react-arcgis";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { renderToString } from "react-dom/server";
import MapPopup from "@/components/maps/MapPopup";
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

        // The svg for the map pin is encoded directly into the default symbol
        const defaultSym = new SimpleMarkerSymbol({
          size: 25,
          width: this.state.isFullMap ? "40" : "80",
          height: this.state.isFullMap ? "40" : "80",
          path:
            "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z",
          outline: new SimpleLineSymbol({ color: [0, 0, 0] }),
          color: [247, 54, 251, 1],
        });

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

        const mapPopupString = renderToString(<MapPopup id="{mineId}" />);

        // The previous code processing point data was nicely seperated into functions, but slow with
        // large datasets taking 5-10 seconds for 50000 points. The code below is ~50ms for 50000 points
        // and uses significantly lower memory.
        const fclData = [];
        mineIds.forEach((mineId) => {
          if (this.props.mines[mineId].mine_location) {
            fclData.push({
              y: Number(this.props.mines[mineId].mine_location.latitude),
              x: Number(this.props.mines[mineId].mine_location.longitude),
              templateTitle: this.props.mines[mineId].mine_name,
              templateContent: mapPopupString.replace("{mineId}", mineId),
            });
          }
        });

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
