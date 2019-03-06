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
  removeMineType,
} from "@/actionCreators/mineActionCreator";
import {
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineDisturbanceOptions,
  fetchMineCommodityOptions,
  setOptionsLoaded,
} from "@/actionCreators/staticContentActionCreator";
import { getMines, getCurrentMineTypes, getTransformedMineTypes } from "@/selectors/mineSelectors";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getOptionsLoaded,
} from "@/selectors/staticContentSelectors";
import {
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
} from "@/actionCreators/partiesActionCreator";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";

import CustomPropTypes from "@/customPropTypes";
import MineTenureInfo from "@/components/mine/Tenure/MineTenureInfo";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineHeader from "@/components/mine/MineHeader";
import * as router from "@/constants/routes";
import MineContactInfo from "@/components/mine/ContactInfo/MineContactInfo";
import MineComplianceInfo from "@/components/mine/Compliance/MineComplianceInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import Loading from "@/components/common/Loading";

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  setOptionsLoaded: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  permittees: PropTypes.objectOf(CustomPropTypes.permittee),
  permitteesIds: PropTypes.arrayOf(PropTypes.string),
  mineTenureHash: PropTypes.objectOf(PropTypes.string),
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  optionsLoaded: PropTypes.bool.isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
};

const defaultProps = {
  permittees: [],
  permitteesIds: [],
  mineTenureHash: {},
  mineComplianceInfo: {},
};

export class MineDashboard extends Component {
  state = { activeTab: "summary", isLoaded: false, complianceInfoLoading: true };

  componentWillMount() {
    const { id, activeTab } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
      this.props.fetchMineComplianceInfo(this.props.mines[id].mine_no, true).then(() => {
        this.setState({ complianceInfoLoading: false });
      });
    });
    if (!this.props.optionsLoaded) {
      this.props.fetchStatusOptions();
      this.props.fetchRegionOptions();
      this.props.fetchMineTenureTypes();
      this.props.fetchMineDisturbanceOptions();
      this.props.fetchMineCommodityOptions();
      this.props.fetchPartyRelationshipTypes();
      this.props.setOptionsLoaded();
    }
    this.props.fetchPartyRelationships({ mine_guid: id, relationships: "party" });

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
    if (!mine) {
      return <Loading />;
    }
    return (
      <div>
        {this.state.isLoaded && (
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
                    <MineSummary
                      mine={mine}
                      permittees={this.props.permittees}
                      permitteeIds={this.props.permitteeIds}
                      mineComplianceInfo={this.props.mineComplianceInfo}
                      complianceInfoLoading={this.state.complianceInfoLoading}
                    />
                  </div>
                </TabPane>
                <TabPane tab="Permit" key="permit">
                  <div className="tab__content">
                    <MinePermitInfo mine={mine} />
                  </div>
                </TabPane>
                <TabPane tab="Contact Information" key="contacts">
                  <div className="tab__content">
                    <MineContactInfo mine={mine} />
                  </div>
                </TabPane>
                <TabPane tab="Compliance" key="compliance">
                  <div className="tab__content">
                    <MineComplianceInfo
                      mineComplianceInfo={this.props.mineComplianceInfo}
                      isLoading={this.state.complianceInfoLoading}
                    />
                  </div>
                </TabPane>
                {/* TODO: Unhide for July release */
                false && (
                  <TabPane tab="Tenure" key="tenure">
                    <div className="tab__content">
                      <MineTenureInfo mine={mine} {...this.props} />
                    </div>
                  </TabPane>
                )}
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
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  currentMineTypes: getCurrentMineTypes(state),
  transformedMineTypes: getTransformedMineTypes(state),
  optionsLoaded: getOptionsLoaded(state),
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
      removeMineType,
      openModal,
      closeModal,
      fetchPartyRelationships,
      fetchPartyRelationshipTypes,
      setOptionsLoaded,
      fetchMineComplianceInfo,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);
