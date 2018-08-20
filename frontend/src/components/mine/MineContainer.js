/**
 * @class MineContainer.js is the connected container which gets a single mine record and passes it down to  MineDashboard.js..
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getMineRecord, updateMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds } from '@/selectors/mineSelectors';
import Loading from '@/components/reusables/Loading';
import MineDashboard from '@/components/mine/MineDashboard';


const propTypes = {
  getMineRecord: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
  match: PropTypes.object
};

const defaultProps = {
  mines: {},
  mineIds: [],
};

export class MineContainer extends Component {
  state = { mineId: ''}

  componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({ mineId: id })
    this.props.getMineRecord(id);
  }

  render() {
    if (this.state.mineId) {
      return (
        this.props.mineIds.map((id) => {
          return (
            <div key={id}>
              <MineDashboard mine={this.props.mines[id]} {...this.props} />
            </div>
          );
        })
      )
    } else {
      return (<Loading />)
    }
  }
}


const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecord,
    updateMineRecord
  }, dispatch);
};

MineContainer.propTypes = propTypes;
MineContainer.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineContainer);