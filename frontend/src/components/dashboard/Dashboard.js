/**
 * @class Dasboard is the main landing page of the application, currently containts a list of viewable mines and the ability to add a new mine.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getMineRecords, getMineNameList, createMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds, getMineNames } from '@/selectors/mineSelectors';
import MineList from '@/components/dashboard/MineList';
import MineSearch from '@/components/dashboard/MineSearch';
import CreateMine from '@/components/dashboard/CreateMine';

const propTypes = {
  getMineRecords: PropTypes.func.isRequired,
  getMineNameList: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func,
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  mineNameList: PropTypes.array.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  mineNameList: [],
};

export class Dashboard extends Component {
  componentDidMount() {
    this.props.getMineRecords();
    this.props.getMineNameList();
  }

  render() {
    return (
      <div>
        <CreateMine createMineRecord={this.props.createMineRecord}/>
        <MineSearch mineNameList={this.props.mineNameList} />
        <MineList mines={this.props.mines} mineIds={this.props.mineIds} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state),
    mineNameList: getMineNames(state).mines,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecords,
    getMineNameList,
    createMineRecord,
  }, dispatch);
};

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
