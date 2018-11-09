import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { openModal, closeModal } from '@/actions/modalActions';
import { fetchMineRecordById, updateMineRecord, fetchStatusOptions, fetchRegionOptions  } from '@/actionCreators/mineActionCreator';
import { getMines, getCurrentPermitteeIds, getCurrentPermittees, getMineStatusOptions, getMineRegionOptions } from '@/selectors/mineSelectors';
import MineTenureInfo from '@/components/mine/Tenure/MineTenureInfo';
import MineSummary from '@/components/mine/Summary/MineSummary';
import MineHeader from '@/components/mine/MineHeader';
import * as router from '@/constants/routes';
import MineContactInfo from '@/components/mine/ContactInfo/MineContactInfo';
import MinePermitInfo from '@/components/mine/Permit/MinePermitInfo';
import Loading from '@/components/common/Loading';
import NullScreen from '@/components/common/NullScreen';

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */
const TabPane = Tabs.TabPane;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func,
  fetchStatusOptions: PropTypes.func.isRequired,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
  permittees: PropTypes.object,
  permitteesIds: PropTypes.array,
  mineStatusOptions: PropTypes.array,
};

const defaultProps = {
  mines: {},
};

export class MineDashboard extends Component {
  state = { activeTab: "summary" }

  handleChange = (activeTab) => {
    this.setState({ activeTab: activeTab});
    this.props.history.push(router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id, activeTab))
  }

  componentDidMount() {
    const { id, activeTab } = this.props.match.params;
    this.props.fetchMineRecordById(id);
    this.props.fetchStatusOptions();
    this.props.fetchRegionOptions();

    if (activeTab) {
      this.setState({activeTab : `${activeTab}`});
    }
  }

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    const { permittees, permitteeIds } = this.props;
    if (!mine) {
      return(<Loading />)
    } else {
        return (
          <div className="dashboard">
            <div>
              <MineHeader mine={mine} {...this.props}/>
            </div>
            <div className="dashboard__content">
              <Tabs
                activeKey={this.state.activeTab}
                defaultActiveKey="summary"
                onChange={this.handleChange}
                size='large'
                animated={{ inkBar: true, tabPane: false }}
              >
                <TabPane tab="Summary" key="summary">
                  <MineSummary mine={mine} permittees={permittees} permitteeIds={permitteeIds}/>
                </TabPane>
                <TabPane tab="Permit" key="permit">
                  <MinePermitInfo mine={mine} />
                </TabPane>
                <TabPane tab="Contact Information" key="contact-information">
                  <MineContactInfo mine={mine} />
                </TabPane>
                <TabPane tab="Compliance" key="compliance">
                  <NullScreen type="generic" />
                </TabPane>
                <TabPane tab="Tenure" key="tenure">
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
    permittees: getCurrentPermittees(state),
    permitteeIds: getCurrentPermitteeIds(state),
    mineStatusOptions: getMineStatusOptions(state),
    mineRegionOptions: getMineRegionOptions(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchMineRecordById,
    fetchStatusOptions,
    fetchRegionOptions,
    updateMineRecord,
    openModal, 
    closeModal
  }, dispatch);
};


MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
