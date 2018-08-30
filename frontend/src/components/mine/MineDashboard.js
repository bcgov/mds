/**
 * @class MineDashboard.js is an individual mines dashboard, contains all relevant information/data from the MineConatiner.js and passes it down to children.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';

import { getUserAccessData } from '@/selectors/authenticationSelectors';

import UpdateMine from './SummaryTab/UpdateMine';
import MineSummary from '@/components/mine/SummaryTab/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineContactInfo from '@/components/mine/ContactTab/MineContactInfo';
import Loading from '@/components/reusables/Loading';

const TabPane = Tabs.TabPane;

const propTypes = {
  getMineRecordById: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mine: PropTypes.object.isRequired,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
  userRoles: PropTypes.array.isRequired,
};

const defaultProps = {
  mine: {},
  mines: {},
  mineIds: [],
  userRoles: [],
};

export class MineDashboard extends Component {
  render() {
    if (!this.props.mine) {
      return(<Loading />)
    } else {
        return (
          <div className="dashboard">
            <div className="dashboard__header">
              <MineHeader mine={this.props.mine} mapData={this.props.mapData}/>
            </div>
            <div className="dashboard__content">
              <Tabs 
                defaultActiveKey="1"
                size='large' 
                className="dashboard__content__tabs"
                animated={{ inkBar: true, tabPane: false }}
              >
                <TabPane tab="Summary" key="1">
                  <MineSummary mine={this.props.mine} />
                  <UpdateMine {...this.props} />
                </TabPane>
                <TabPane tab="Permit" key="2">
                </TabPane>
                <TabPane tab="Contact Information" key="3">
                  <MineContactInfo mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Compliance" key="4">
                </TabPane>
                <TabPane tab="Tenure" key="5">
                </TabPane>
              </Tabs>
            </div>
          </div>
        );
      }
    }
  }

const mapStateToProps = (state) => {
  return {
    userRoles: getUserAccessData(state),
  };
};


MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(MineDashboard);
