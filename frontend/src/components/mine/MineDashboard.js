/**
 * @class MineDashboard.js is an individual mines dashboard, contains all relevant information/data and passes it down to children.
 */
import React, { Component } from 'react';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';

import { UpdateMineForm } from './UpdateMineForm';
import MineSummary from '@/components/mine/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineContactInfo from '@/components/mine/ContactTab/MineContactInfo';

const TabPane = Tabs.TabPane;

const propTypes = {
  getMineRecord: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mine: PropTypes.object.isRequired,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
  mineId: PropTypes.string.isRequired,
};

const defaultProps = {
  mine: {},
  mines: {},
  mineIds: [],
  mineId: ''
};

class MineDashboard extends Component {
  render() {
      return (
        <div>
          <MineHeader mine={this.props.mine}/>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Summary" key="1">
              <MineSummary mine={this.props.mine} />
              <UpdateMineForm {...this.props} />
            </TabPane>
            <TabPane tab="Contact Information" key="2">
              <MineContactInfo mine={this.props.mine}/>
            </TabPane>
          </Tabs>
        </div>
      );
    } 
  }

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default MineDashboard;
