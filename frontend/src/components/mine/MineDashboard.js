import React, { Component } from "react";
import { connect } from "react-redux";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  fetchMineRecordById,
  updateMineRecord,
  createTailingsStorageFacility,
} from "@/actionCreators/mineActionCreator";
import {
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineDisturbanceOptions,
  fetchMineCommodityOptions,
} from "@/actionCreators/staticContentActionCreator";
import { getMines, getCurrentPermitteeIds, getCurrentPermittees } from "@/selectors/mineSelectors";
import {
  getMineRegionHash,
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypesHash,
  getMineTenureTypes,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
} from "@/selectors/staticContentSelectors";
import MineTenureInfo from "@/components/mine/Tenure/MineTenureInfo";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineHeader from "@/components/mine/MineHeader";
import * as router from "@/constants/routes";
import MineContactInfo from "@/components/mine/ContactInfo/MineContactInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func,
  createTailingsStorageFacility: PropTypes.func,
  fetchStatusOptions: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  mines: PropTypes.object,
  mineIds: PropTypes.array,
  permittees: PropTypes.object,
  permitteesIds: PropTypes.array,
  mineStatusOptions: PropTypes.array,
  mineRegionOptions: PropTypes.array,
  mineTenureTypes: PropTypes.array,
  mineTenureHash: PropTypes.obj,
};

const defaultProps = {
  mines: {},
};

export class MineDashboard extends Component {
  state = { activeTab: "summary" };

  componentDidMount() {
    const { id, activeTab } = this.props.match.params;
    this.props.fetchMineRecordById(id);
    this.props.fetchStatusOptions();
    this.props.fetchRegionOptions();
    this.props.fetchMineTenureTypes();
    this.props.fetchMineDisturbanceOptions();
    this.props.fetchMineCommodityOptions();

    if (activeTab) {
      this.setState({ activeTab: `${activeTab}` });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { activeTab } = nextProps.match.params;
    if (activeTab !== this.props.activeTab) {
      this.setState({ activeTab });
    }
  }

  handleChange = (activeTab) => {
    this.setState({ activeTab });
    this.props.history.push(
      router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id, activeTab)
    );
  };

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    const { permittees, permitteeIds } = this.props;
    if (!mine) {
      return <Loading />;
    }
    return (
      <div className="dashboard">
        <div>
          <MineHeader mine={mine} {...this.props} />
        </div>
        <div className="dashboard__content">
          <Tabs
            activeKey={this.state.activeTab}
            defaultActiveKey="summary"
            onChange={this.handleChange}
            size="large"
            animated={{ inkBar: true, tabPane: false }}
          >
            <TabPane tab="Summary" key="summary">
              <div className="tab__content">
                <MineSummary mine={mine} permittees={permittees} permitteeIds={permitteeIds} />
              </div>
            </TabPane>
            <TabPane tab="Permit" key="permit">
              <div className="tab__content">
                <MinePermitInfo mine={mine} />
              </div>
            </TabPane>
            <TabPane tab="Contact Information" key="contact-information">
              <div className="tab__content">
                <MineContactInfo mine={mine} />
              </div>
            </TabPane>
            <TabPane tab="Compliance" key="compliance">
              <div className="tab__content">
                <NullScreen type="generic" />
              </div>
            </TabPane>
            <TabPane tab="Tenure" key="tenure">
              <div className="tab__content">
                <MineTenureInfo mine={mine} {...this.props} />
              </div>
            </TabPane>
            {mine.mine_tailings_storage_facility.length > 0 && (
              <TabPane tab="Tailings" key="tailings">
                <div className="tab__content">
                  <MineTailingsInfo mine={mine} {...this.props} />
                </div>
              </TabPane>
            )}
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  permittees: getCurrentPermittees(state),
  permitteeIds: getCurrentPermitteeIds(state),
  mineStatusOptions: getMineStatusOptions(state),
  mineRegionOptions: getMineRegionOptions(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineTenureTypes: getMineTenureTypes(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchStatusOptions,
      fetchRegionOptions,
      fetchMineTenureTypes,
      fetchMineDisturbanceOptions,
      fetchMineCommodityOptions,
      updateMineRecord,
      createTailingsStorageFacility,
      openModal,
      closeModal,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);
