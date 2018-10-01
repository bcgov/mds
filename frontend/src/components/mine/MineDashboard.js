/**
 * @class MineDashboard.js is an individual mines dashboard
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import { getMineRecordById, updateMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines } from '@/selectors/mineSelectors';
import MineTenureInfo from '@/components/mine/TenureTab/MineTenureInfo';
import MineSummary from '@/components/mine/SummaryTab/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import MineContactInfo from '@/components/mine/ContactTab/MineContactInfo';
import MinePermitInfo from '@/components/mine/PermitTab/MinePermitInfo';
import Loading from '@/components/common/Loading';
import NullScreen from '@/components/common/NullScreen';


const TabPane = Tabs.TabPane;

const propTypes = {
  getMineRecordById: PropTypes.func,
  updateMineRecord: PropTypes.func,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
};

const defaultProps = {
  mines: {},
};

export class MineDashboard extends Component {

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.getMineRecordById(id);
  }

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    if (!mine) {
      return(<Loading />)
    } else {
        return (
          <div className="dashboard">
            <div>
              <MineHeader mine={mine} />
            </div>
            <div className="dashboard__content">
              <Tabs
                defaultActiveKey="1"
                size='large'
                animated={{ inkBar: true, tabPane: false }}
              >
                <TabPane tab="Summary" key="1">
                  <MineSummary mine={mine} />
                </TabPane>
                <TabPane tab="Permit" key="2">
                  <MinePermitInfo mine={mine} />
                </TabPane>
                <TabPane tab="Contact Information" key="3">
                  <MineContactInfo mine={mine} />
                </TabPane>
                <TabPane tab="Compliance" key="4">
                  <NullScreen type="generic" />
                </TabPane>
                <TabPane tab="Tenure" key="5">
                  <MineTenureInfo mine={mine} {...this.props}/>
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
    mines: getMines(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecordById,
    updateMineRecord
  }, dispatch);
};


MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
