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
          <div>
            <MineHeader mine={this.props.mine} mapData={this.props.mapData}/>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Summary" key="1">
                <MineSummary mine={this.props.mine} />
                <UpdateMine {...this.props} />
              </TabPane>
              <TabPane tab="Contact Information" key="2">
                <MineContactInfo mine={this.props.mine}/>
              </TabPane>
            </Tabs>
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
