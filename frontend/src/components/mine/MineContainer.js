/**
 * @class MineContainer.js is the connected container which gets the single mine and passed that mine into Dashboard relevant information/data.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Col, Row, Tabs } from 'antd';

import { getMineRecord, updateMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds } from '@/selectors/mineSelectors';
import { UpdateMineForm } from './UpdateMineForm';
import Loading from '@/components/reusables/Loading';
import MineSummary from '@/components/mine/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineDashboard from '@/components/mine/MineDashboard';
const staticMap = require('../../assets/images/staticMap.png');

const TabPane = Tabs.TabPane;
// let { id } = null;

class MineContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mineId: ''
    }
  }

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

export default connect(mapStateToProps, mapDispatchToProps)(MineContainer);