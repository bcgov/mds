/**
 * @class MineDashboard.js is an individual mines dashboard, contains all relevant information/data and passes it down to children.
 */
import React, { Component } from 'react';
import { Card, Col, Row, Tabs } from 'antd';
import PropTypes from 'prop-types';

import { UpdateMineForm } from './UpdateMineForm';
import MineSummary from '@/components/mine/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineContactInfo from '@/components/mine/MineContactInfo';

const TabPane = Tabs.TabPane;

const propTypes = {
  getMineRecord: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mine: PropTypes.object,
  mines: PropTypes.object,
  mineIds: PropTypes.object,
};

const defaultProps = {
  mine: {},
  mines: {},
  mineIds: {},
};

class MineDashboard extends Component {
  render() {
      return (
        <div>
          <MineHeader {...this.props}/>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Summary" key="1">
              <MineSummary {...this.props} />
              <UpdateMineForm {...this.props} />
            </TabPane>
            <TabPane tab="Contact Information" key="2">
              <MineContactInfo />
            </TabPane>
          </Tabs>
        </div>
      );
    } 
  }

export default MineDashboard;
