/**
 * @class MineContainer.js is the connected container which gets a single mine record and passes it down to  MineDashboard.js..
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getMineRecordById, updateMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines } from '@/selectors/mineSelectors';
import Loading from '@/components/reusables/Loading';
import MineDashboard from '@/components/mine/MineDashboard';


const propTypes = {
  getMineRecordById: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mines: PropTypes.object,
  match: PropTypes.object
};

const defaultProps = {
  mines: {},
};

export class MineContainer extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.getMineRecordById(id);
  }

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    if (mine) {
      return (
        <MineDashboard mine={mine} {...this.props} />
      )
    } else {
      return (<Loading />)
    }
  }
}


const mapStateToProps = (state) => {
  return {
    mines: getMines(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecordById,
    updateMineRecord
  }, dispatch);
};

MineContainer.propTypes = propTypes;
MineContainer.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineContainer);