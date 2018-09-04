/**
 * @class MineDashboard.js is an individual mines dashboard, contains all relevant information/data from the MineConatiner.js and passes it down to children.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';

import { getUserAccessData } from '@/selectors/authenticationSelectors';
import MineTenureInfo from './TenureTab/MineTenureInfo';
import MineSummary from '@/components/mine/SummaryTab/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineContactInfo from '@/components/mine/ContactTab/MineContactInfo';
import Loading from '@/components/reusables/Loading';
import NullScreen from '@/components/reusables/NullScreen'; 
import { NO_MINE } from '@/constants/assets';

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
            <div>
              <MineHeader mine={this.props.mine} mapData={this.props.mapData}/>
            </div>
            <div className="dashboard__content">
              <Tabs 
                defaultActiveKey="1"
                size='large'
                animated={{ inkBar: true, tabPane: false }}
              >
                <TabPane tab="Summary" key="1">
                  <MineSummary mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Permit" key="2">
                  <NullScreen primaryMessage="No data at this time" img={NO_MINE} />
                </TabPane>
                <TabPane tab="Contact Information" key="3">
                  <MineContactInfo mine={this.props.mine} />
                </TabPane>
                <TabPane tab="Compliance" key="4">
                  <NullScreen primaryMessage="No data at this time" img={NO_MINE} />
                </TabPane>
                <TabPane tab="Tenure" key="5">
                  <MineTenureInfo {...this.props}/>
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
