/**
 * @class MinePin.js must be the child of arcGIS <Map /> or <Sceen />,
 * MinePin is connected to redux to access/display all mines information - reusalble on any view will display the
 *
 */
import { Component } from 'react';
import { loadModules } from 'react-arcgis';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getMines, getMineIds } from '@/selectors/mineSelectors';

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired
};

const defaultProps = {
  mines: {},
  mineIds: [],
  view: {}
};

const symbol = {
  "url": '../../../public/Pin.svg',
  "height": 40,
  "width": 30,
  "type": "picture-marker"
};

export class MinePin extends Component {
 state = { graphic: null };

  popupTemplate(id) {
    const { mine_name } = this.props.mines[id].mine_detail[0];
    return {
      title: mine_name,
      content:
      `<div>
        <div>
          <a href={router.MINE_SUMMARY.dynamicRoute(id)}>
            View
          </a>
        </div>
      </div>`
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
      const mineId = this.props.match.params.id;
      let mineIds = [];
      if (mineId) {
        mineIds = [mineId];
      }
      else {
        mineIds = this.props.mineIds;
      }

      const graphicArray = mineIds.map((id) => {
        return (
          new Graphic({
            geometry: this.points(id),
            symbol: symbol,
            popupTemplate: this.popupTemplate(id)
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