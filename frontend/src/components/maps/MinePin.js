/**
 * @class MinePin.js must be the child of arcGIS <Map /> or <Sceen />,
 * MinePin is connected to redux to access/display all mines information - reusalble on any view will display the
 *
 */
import React, { Component } from 'react';
import { loadModules } from 'react-arcgis';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import MapPopup from '@/components/maps/MapPopup'
import { renderToString } from 'react-dom/server'


import { getMines, getMineIds } from '@/selectors/mineSelectors';

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  view: {}
};

export class MinePin extends Component {
 state = { graphic: null, isFullMap: false };

  popupTemplate(id) {
    const { mine_name } = this.props.mines[id].mine_detail[0];
    const content = renderToString(<MapPopup id={id} />);
    return {
      title: mine_name,
      content: content
    };
  }

  points = (id) => {
    if (this.props.mines[id].mine_location[0]) {
      return {
      type: "point",
      longitude: this.props.mines[id].mine_location[0].longitude,
      latitude: this.props.mines[id].mine_location[0].latitude,
      }
    } else {
      return null;
    }
  }

  componentWillMount() {
    loadModules(['esri/Graphic']).then(([Graphic]) => {
      // create a new Graphic for every mine in the array or fetch the ID from the URL for a single mine.
      // data must be passed into this.points() and this.popupTemplate to associate the correct information with the correct lat/long.
      const { id } = this.props.match.params;
      let mineIds = [];
      if (id) {
        mineIds = [id];
        this.setState({ isFullMap: false})
      }
      else {
        this.setState({ isFullMap: true})
        mineIds = this.props.mineIds;
      }
      const symbol = {
        "url": '../../../public/Pin.svg',
        "width": this.state.isFullMap ? '40' : '80',
        "height": this.state.isFullMap ? '40' : '80',
        "type": "picture-marker"
      };

      const graphicArray = mineIds.map((id) => {
        return (
          new Graphic({
            geometry: this.points(id),
            symbol: symbol,
            popupTemplate: this.state.isFullMap ? this.popupTemplate(id) : null
          })
        )
      })

      this.setState({ graphic: graphicArray });
      this.props.view.graphics.removeAll();
      this.props.view.graphics.addMany(graphicArray);
    });
  }

  componentWillUnmount() {
    this.props.view.graphics.remove(this.state.graphic);
  }
  render() {
    return (
      null
    );
  }
}

MinePin.propTypes = propTypes;
MinePin.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state)
  };
};

export default withRouter(connect(mapStateToProps, null)(MinePin));