import React, { Component } from "react";
import { connect } from "react-redux";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import queryString from "query-string";
import { isEmpty } from "lodash";
import { openModal, closeModal } from "@/actions/modalActions";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import {
  fetchMineRecordById,
  updateMineRecord,
  createTailingsStorageFacility,
  removeMineType,
  fetchSubscribedMinesByUser,
  unSubscribe,
  subscribe,
} from "@/actionCreators/mineActionCreator";
import {
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineDisturbanceOptions,
  fetchMineCommodityOptions,
  fetchPermitStatusOptions,
  fetchApplicationStatusOptions,
  fetchMineComplianceCodes,
  fetchMineIncidentFollowActionOptions,
  fetchMineIncidentDeterminationOptions,
  fetchMineIncidentStatusCodeOptions,
  fetchVarianceDocumentCategoryOptions,
  fetchVarianceStatusOptions,
  fetchMineReportDefinitionOptions,
} from "@/actionCreators/staticContentActionCreator";
import {
  getMines,
  getCurrentMineTypes,
  getTransformedMineTypes,
  getIsUserSubscribed,
} from "@/selectors/mineSelectors";
import {
  createVariance,
  fetchVariancesByMine,
  addDocumentToVariance,
  updateVariance,
} from "@/actionCreators/varianceActionCreator";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getDropdownHSRCMComplianceCodes,
  getHSRCMComplianceCodesHash,
  getMultiSelectComplianceCodes,
  getDropdownVarianceStatusOptions,
  getVarianceStatusOptionsHash,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptionsHash,
} from "@/selectors/staticContentSelectors";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { getVarianceApplications, getApprovedVariances } from "@/selectors/varianceSelectors";
import { getDropdownInspectors, getInspectorsHash } from "@/selectors/partiesSelectors";
import {
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
  fetchInspectors,
} from "@/actionCreators/partiesActionCreator";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";
import CustomPropTypes from "@/customPropTypes";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineVariance from "@/components/mine/Variances/MineVariance";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import MineReportInfo from "@/components/mine/Reports/MineReportInfo";
import MineHeader from "@/components/mine/MineHeader";
import * as router from "@/constants/routes";
import MineContactInfo from "@/components/mine/ContactInfo/MineContactInfo";
import MineComplianceInfo from "@/components/mine/Compliance/MineComplianceInfo";
import MinePermitInfo from "@/components/mine/Permit/MinePermitInfo";
import MineApplicationInfo from "@/components/mine/Applications/MineApplicationInfo";
import Loading from "@/components/common/Loading";
import { formatParamStringToArray } from "@/utils/helpers";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import { storeRegionOptions, storeTenureTypes } from "@/actions/staticContentActions";
import { storeVariances } from "@/actions/varianceActions";
import { storePermits } from "@/actions/permitActions";
import { storeMine } from "@/actions/mineActions";
import { detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  getDropdownVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string),
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  fetchApplications: PropTypes.func.isRequired,
  fetchMineIncidentFollowActionOptions: PropTypes.func.isRequired,
  fetchMineIncidentDeterminationOptions: PropTypes.func.isRequired,
  fetchMineIncidentStatusCodeOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  updateVariance: PropTypes.func.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
};

const defaultProps = {
  mineTenureHash: {},
  mineComplianceInfo: {},
};

const initialSearchValues = {
  order_no: "",
  report_no: "",
  due_date: "",
  inspector: "",
  violation: [],
  order_status: "",
};

export class MineDashboard extends Component {
  state = {
    activeTab: "summary",
    isLoaded: false,
    complianceInfoLoading: true,
    complianceFilterParams: initialSearchValues,
    filteredOrders: [],
  };

  componentWillMount() {
    const { id, activeTab } = this.props.match.params;
    this.loadMineData(id);
    this.props.fetchStatusOptions();
    this.props.fetchRegionOptions();
    this.props.fetchMineTenureTypes();
    this.props.fetchMineDisturbanceOptions();
    this.props.fetchMineCommodityOptions();
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPermitStatusOptions();
    this.props.fetchApplicationStatusOptions();
    this.props.fetchMineComplianceCodes();
    this.props.fetchPartyRelationships({ mine_guid: id, relationships: "party" });
    this.props.fetchSubscribedMinesByUser();
    this.props.fetchVarianceDocumentCategoryOptions();
    this.props.fetchMineReportDefinitionOptions();
    this.props.fetchVarianceStatusOptions();
    this.props.fetchInspectors();
    if (activeTab) {
      this.setState({ activeTab });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { id, activeTab } = nextProps.match.params;
    if (activeTab !== this.props.activeTab) {
      this.setState({ activeTab });
    }
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.loadMineData(id);
    }
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged && !this.state.complianceInfoLoading) {
      const correctParams = nextProps.location.search
        ? nextProps.location.search
        : queryString.stringify(initialSearchValues);
      this.renderDataFromURL(correctParams);
    }
  }

  componentWillUnmount() {
    this.setState({ complianceFilterParams: initialSearchValues });
  }

  renderDataFromURL = (params) => {
    const { violation, ...remainingParams } = queryString.parse(params);
    const formattedParams = {
      violation: formatParamStringToArray(violation),
      ...remainingParams,
    };

    const orders =
      this.props.mineComplianceInfo && this.props.mineComplianceInfo.orders
        ? this.props.mineComplianceInfo.orders
        : [];
    const filteredOrders = orders.filter((order) => this.handleFiltering(order, formattedParams));

    this.setState({
      filteredOrders,
      complianceFilterParams: formattedParams,
    });
  };

  handleFiltering = (order, params) => {
    // convert string to boolean before passing it into a filter check
    const order_status =
      params.order_status === "" || order.order_status.includes(params.order_status);
    const inspector =
      params.inspector === "" ||
      order.inspector.toLowerCase().includes(params.inspector.toLowerCase());
    const date = params.due_date === "" || order.due_date.includes(params.due_date);
    const orderNo = params.order_no === "" || order.order_no.includes(params.order_no);
    const reportNoString = order.report_no.toString();
    const reportNo = params.report_no === "" || reportNoString.includes(params.report_no);
    const violation = params.violation.length === 0 || params.violation.includes(order.violation);
    return order_status && inspector && date && orderNo && reportNo && violation;
  };

  handleComplianceFilter = (values) => {
    if (isEmpty(values)) {
      this.props.history.push(
        router.MINE_SUMMARY.dynamicRoute(
          this.props.match.params.id,
          this.props.match.params.activeTab
        )
      );
    } else {
      const { violation, ...rest } = values;
      this.props.history.push(
        router.MINE_SUMMARY.dynamicRoute(
          this.props.match.params.id,
          this.props.match.params.activeTab,
          {
            violation: violation && violation.join(","),
            ...rest,
          }
        )
      );
    }
  };

  handleSubscription = () => {
    const { id } = this.props.match.params;
    const mineName = this.props.mines[id].mine_name;
    this.props.subscribe(id, mineName).then(() => {
      this.props.fetchSubscribedMinesByUser();
    });
  };

  handleUnSubscribe = () => {
    const { id } = this.props.match.params;
    const mineName = this.props.mines[id].mine_name;
    this.props.unSubscribe(id, mineName).then(() => {
      this.props.fetchSubscribedMinesByUser();
    });
  };

  handleChange = (activeTab) => {
    this.setState({ activeTab });
    this.props.history.push(
      router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id, activeTab)
    );
  };

  loadMineData(id) {
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchApplications({ mine_guid: this.props.mines[id].mine_guid });
      this.props.fetchPermits(this.props.mines[id].mine_guid);
      this.props.fetchVariancesByMine({ mineGuid: id });
      this.setState({ isLoaded: true });
      this.props.fetchPartyRelationships({ mine_guid: id, relationships: "party" });
      this.props.fetchApplications({ mine_guid: id });
      this.props.fetchMineComplianceInfo(this.props.mines[id].mine_no, true).then((data) => {
        this.setState({
          complianceInfoLoading: false,
          filteredOrders: data && data.orders ? data.orders : [],
        });
      });
    });
  }

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
              <MineHeader
                mine={mine}
                {...this.props}
                handleUnSubscribe={this.handleUnSubscribe}
                handleSubscription={this.handleSubscription}
                subscribed={this.props.subscribed}
                refreshActions={[storeMine]}
                refreshListActions={[
                  storeRegionOptions,
                  storeTenureTypes,
                  storeVariances,
                  storePermits,
                ]}
                refreshRequests={[
                  this.props.fetchRegionOptions,
                  this.props.fetchMineTenureTypes,
                  () => this.props.fetchVariancesByMine({ mineGuid: id }),
                  () => this.props.fetchPermits(mine.mine_guid),
                  () => this.props.fetchMineRecordById(id),
                ]}
              />
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
                      mineComplianceInfo={this.props.mineComplianceInfo}
                      complianceInfoLoading={this.state.complianceInfoLoading}
                    />
                  </div>
                </TabPane>
                {mine.major_mine_ind && (
                  <TabPane tab="Applications" key="applications">
                    <div className="tab__content">
                      <MineApplicationInfo
                        mine={mine}
                        openModal={this.props.openModal}
                        closeModal={this.props.closeModal}
                      />
                    </div>
                  </TabPane>
                )}
                <TabPane tab="Permit" key="permit">
                  <div className="tab__content">
                    <MinePermitInfo mine={mine} {...this.props} />
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
                      complianceCodes={this.props.multiSelectComplianceCodes}
                      handleComplianceFilter={this.handleComplianceFilter}
                      complianceFilterParams={this.state.complianceFilterParams}
                      filteredOrders={this.state.filteredOrders}
                      mineComplianceInfo={this.props.mineComplianceInfo}
                      isLoading={this.state.complianceInfoLoading}
                    />
                  </div>
                </TabPane>
                <TabPane tab="Variance" key="variance">
                  <div className="tab__content">
                    <MineVariance
                      mine={mine}
                      inspectors={this.props.inspectors}
                      createVariance={this.props.createVariance}
                      varianceDocumentCategoryOptions={this.props.varianceDocumentCategoryOptions}
                      varianceDocumentCategoryOptionsHash={
                        this.props.varianceDocumentCategoryOptionsHash
                      }
                      addDocumentToVariance={this.props.addDocumentToVariance}
                      openModal={this.props.openModal}
                      closeModal={this.props.closeModal}
                      fetchVariancesByMine={this.props.fetchVariancesByMine}
                      varianceApplications={this.props.varianceApplications}
                      approvedVariances={this.props.approvedVariances}
                      complianceCodes={this.props.complianceCodes}
                      complianceCodesHash={this.props.complianceCodesHash}
                      varianceStatusOptions={this.props.varianceStatusOptions}
                      updateVariance={this.props.updateVariance}
                      varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
                      inspectorsHash={this.props.inspectorsHash}
                    />
                  </div>
                </TabPane>
                {mine.mine_tailings_storage_facilities.length > 0 && (
                  <TabPane tab="Tailings" key="tailings">
                    <div className="tab__content">
                      <MineTailingsInfo mine={mine} {...this.props} />
                    </div>
                  </TabPane>
                )}
                <TabPane tab="Incidents" key="incidents">
                  <div className="tab__content">
                    <MineIncidents
                      mine={mine}
                      inspectors={this.props.inspectors}
                      openModal={this.props.openModal}
                      closeModal={this.props.closeModal}
                    />
                  </div>
                </TabPane>
                {!detectProdEnvironment() && (
                  <TabPane tab="Reports" key="reports">
                    <div className="tab__content">
                      <MineReportInfo
                        mine={mine}
                        openModal={this.props.openModal}
                        closeModal={this.props.closeModal}
                      />
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
  subscribed: getIsUserSubscribed(state),
  approvedVariances: getApprovedVariances(state),
  varianceApplications: getVarianceApplications(state),
  complianceCodes: getDropdownHSRCMComplianceCodes(state),
  multiSelectComplianceCodes: getMultiSelectComplianceCodes(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  mineComplianceInfo: getMineComplianceInfo(state),
  inspectors: getDropdownInspectors(state),
  varianceStatusOptions: getDropdownVarianceStatusOptions(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  inspectorsHash: getInspectorsHash(state),
  varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  userRoles: getUserAccessData(state),
  varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
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
      fetchPermitStatusOptions,
      fetchApplicationStatusOptions,
      fetchMineComplianceInfo,
      fetchApplications,
      fetchSubscribedMinesByUser,
      unSubscribe,
      subscribe,
      fetchPermits,
      createVariance,
      addDocumentToVariance,
      fetchVarianceDocumentCategoryOptions,
      fetchMineReportDefinitionOptions,
      fetchVariancesByMine,
      fetchMineComplianceCodes,
      fetchInspectors,
      fetchMineIncidentFollowActionOptions,
      fetchMineIncidentDeterminationOptions,
      fetchMineIncidentStatusCodeOptions,
      fetchVarianceStatusOptions,
      updateVariance,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);
