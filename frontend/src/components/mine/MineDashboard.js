/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import queryString from "query-string";
import { isEmpty } from "lodash";
import { Menu, Icon, Button, Dropdown, Popconfirm, Tooltip, Tabs } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import {
  fetchMineRecordById,
  updateMineRecord,
  createTailingsStorageFacility,
  removeMineType,
  fetchSubscribedMinesByUser,
  unSubscribe,
  subscribe,
  setMineVerifiedStatus,
  fetchMineVerifiedStatuses,
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
import MineTenureInfo from "@/components/mine/Tenure/MineTenureInfo";
import MineTailingsInfo from "@/components/mine/Tailings/MineTailingsInfo";
import MineSummary from "@/components/mine/Summary/MineSummary";
import MineVariance from "@/components/mine/Variances/MineVariance";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import MineReportInfo from "@/components/mine/Reports/MineReportInfo";
import MineHeader from "@/components/mine/MineHeader";
import * as router from "@/constants/routes";
import Loading from "@/components/common/Loading";
import { formatDate } from "@/utils/helpers";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import MineNavigation from "@/components/mine/MineNavigation";
import { storeRegionOptions, storeTenureTypes } from "@/actions/staticContentActions";
import { storeVariances } from "@/actions/varianceActions";
import { storePermits } from "@/actions/permitActions";
import { storeMine } from "@/actions/mineActions";
import MineDashboardRoutes from "@/routes/MineDashboardRoutes";
import { SUBSCRIBE, UNSUBSCRIBE, YELLOW_HAZARD, SUCCESS_CHECKMARK } from "@/constants/assets";
import RefreshButton from "@/components/common/RefreshButton";
import { detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */

const propTypes = {
  match: CustomPropTypes.match.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  getDropdownVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  createVariance: PropTypes.func.isRequired,
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

export class MineDashboard extends Component {
  state = {
    menuVisible: false,
    isLoaded: false,
    activeNavButton: "mine-information",
  };

  componentWillMount() {
    const { id } = this.props.match.params;
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
  }

  componentWillReceiveProps(nextProps) {
    const { id } = nextProps.match.params;
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.loadMineData(id);
    }
    // const locationChanged = nextProps.location !== this.props.location;
    // if (locationChanged && !this.state.complianceInfoLoading) {
    //   const correctParams = nextProps.location.search
    //     ? nextProps.location.search
    //     : queryString.stringify(initialSearchValues);
    //   this.renderDataFromURL(correctParams);
    // }
  }

  // componentWillUnmount() {
  //   this.setState({ complianceFilterParams: initialSearchValues });
  // }

  // renderDataFromURL = (params) => {
  //   const { violation, ...remainingParams } = queryString.parse(params);
  //   const formattedParams = {
  //     violation: formatParamStringToArray(violation),
  //     ...remainingParams,
  //   };

  //   const orders =
  //     this.props.mineComplianceInfo && this.props.mineComplianceInfo.orders
  //       ? this.props.mineComplianceInfo.orders
  //       : [];
  //   const filteredOrders = orders.filter((order) => this.handleFiltering(order, formattedParams));

  //   this.setState({
  //     filteredOrders,
  //     complianceFilterParams: formattedParams,
  //   });
  // };

  // handleFiltering = (order, params) => {
  //   // convert string to boolean before passing it into a filter check
  //   const order_status =
  //     params.order_status === "" || order.order_status.includes(params.order_status);
  //   const inspector =
  //     params.inspector === "" ||
  //     order.inspector.toLowerCase().includes(params.inspector.toLowerCase());
  //   const date = params.due_date === "" || order.due_date.includes(params.due_date);
  //   const orderNo = params.order_no === "" || order.order_no.includes(params.order_no);
  //   const reportNoString = order.report_no.toString();
  //   const reportNo = params.report_no === "" || reportNoString.includes(params.report_no);
  //   const violation = params.violation.length === 0 || params.violation.includes(order.violation);
  //   return order_status && inspector && date && orderNo && reportNo && violation;
  // };

  // handleComplianceFilter = (values) => {
  //   if (isEmpty(values)) {
  //     this.props.history.push(router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id));
  //   } else {
  //     const { violation, ...rest } = values;
  //     this.props.history.push(
  //       router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id, {
  //         violation: violation && violation.join(","),
  //         ...rest,
  //       })
  //     );
  //   }
  // };

  handleVerifyMineData = (e) => {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    e.stopPropagation();
    this.props.setMineVerifiedStatus(mine.mine_guid, { healthy: true }).then(() => {
      this.props.fetchMineRecordById(mine.mine_guid);
      this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
      this.handleMenuClick();
    });
  };

  handleUnverifyMineData = (e) => {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    e.stopPropagation();
    this.props.setMineVerifiedStatus(mine.mine_guid, { healthy: false }).then(() => {
      this.props.fetchMineRecordById(mine.mine_guid);
      this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
      this.handleMenuClick();
    });
  };

  handleSubscription = () => {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    this.props.subscribe(mine.mine_guid, mine.mine_name).then(() => {
      this.props.fetchSubscribedMinesByUser();
      this.handleMenuClick();
    });
  };

  handleUnSubscribe = () => {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    this.props.unSubscribe(mine.mine_guid, mine.mine_name).then(() => {
      this.props.fetchSubscribedMinesByUser();
      this.handleMenuClick();
    });
  };

  // added some extra logic to the dropdown, to handle closing the menu after popconfirm is clicked.
  // The combination of popconfirm, and the AuthWrapper interferes with the dropdowns default behaviour.
  handleVisibleChange = (flag) => {
    this.setState({ menuVisible: flag });
  };

  handleMenuClick = () => {
    this.setState({ menuVisible: false });
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

    const menu = (
      <Menu>
        {this.props.subscribed ? (
          <div className="custom-menu-item">
            <Popconfirm
              placement="left"
              title="Are you sure you want to unsubscribe?"
              onConfirm={this.handleUnSubscribe}
              okText="Yes"
              cancelText="No"
            >
              <button type="button" className="full">
                <img alt="document" className="padding-small" src={UNSUBSCRIBE} />
                Unsubscribe from mine
              </button>
            </Popconfirm>
          </div>
        ) : (
          <div className="custom-menu-item">
            <button type="button" className="full" onClick={this.handleSubscription}>
              <img alt="document" className="padding-small" src={SUBSCRIBE} />
              Subscribe to mine
            </button>
          </div>
        )}
        <div className="custom-menu-item">
          <RefreshButton
            isNestedButton
            actions={[storeMine]}
            listActions={[storeRegionOptions, storeTenureTypes, storeVariances, storePermits]}
            requests={[
              this.props.fetchRegionOptions,
              this.props.fetchMineTenureTypes,
              () => this.props.fetchVariancesByMine({ mineGuid: id }),
              () => this.props.fetchPermits(mine.mine_guid),
              () => this.props.fetchMineRecordById(id),
            ]}
          />
        </div>
        <AuthorizationWrapper permission={Permission.ADMIN}>
          {mine.verified_status.healthy_ind !== true && (
            <div className="custom-menu-item">
              <Popconfirm
                placement="left"
                title="Are you sure?"
                onConfirm={this.handleVerifyMineData}
                okText="Yes"
                cancelText="No"
              >
                <button type="button" className="full">
                  <img
                    alt="checkmark"
                    className="padding-small"
                    src={SUCCESS_CHECKMARK}
                    width="30"
                  />
                  Verify mine data
                </button>
              </Popconfirm>
            </div>
          )}
          {mine.verified_status.healthy_ind !== false && (
            <div className="custom-menu-item">
              <Popconfirm
                placement="left"
                title="Are you sure?"
                onConfirm={this.handleUnverifyMineData}
                okText="Yes"
                cancelText="No"
              >
                <button type="button" className="full">
                  <img alt="hazard" className="padding-small" src={YELLOW_HAZARD} width="30" />
                  Re-verify mine data
                </button>
              </Popconfirm>
            </div>
          )}
        </AuthorizationWrapper>
      </Menu>
    );

    return (
      <div>
        {this.state.isLoaded && (
          <div>
            <div className="tab__content">
              <div className="inline-flex block-mobile between">
                <div className="inline-flex horizontal-center block-tablet">
                  <h1 className="padding-large--right">{mine.mine_name}</h1>
                  <div>Mine No. {mine.mine_no}</div>
                  {mine.verified_status.healthy_ind !== null && (
                    <img
                      alt=""
                      className="padding-small"
                      src={mine.verified_status.healthy_ind ? SUCCESS_CHECKMARK : YELLOW_HAZARD}
                      title={
                        mine.verified_status.healthy_ind
                          ? `Mine data verified by ${
                              mine.verified_status.verifying_user
                            } on ${formatDate(mine.verified_status.verifying_timestamp)}`
                          : "Please double-check this mine's data and re-verify"
                      }
                      width="30"
                    />
                  )}
                  {this.props.subscribed && (
                    <Tooltip title="Subscribed" placement="top" mouseEnterDelay={1}>
                      <img src={SUBSCRIBE} alt="SUBSCRIBE" />
                    </Tooltip>
                  )}
                </div>
                <Dropdown
                  overlay={menu}
                  placement="bottomLeft"
                  onVisibleChange={this.handleVisibleChange}
                  visible={this.state.menuVisible}
                >
                  <Button type="secondary">
                    Options
                    <Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
            </div>
            <MineNavigation mine={mine} activeButton={this.state.activeButton} />
            <MineDashboardRoutes />

            {/* TO DO: REMOVING AS I COMPLETE THE NEW VIEW */}
            {/* <div className="dashboard__content">
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
                     
                    />
                  </div>
                </TabPane>
                {
                false && (
                  <TabPane tab="Tenure" key="tenure">
                    <div className="tab__content">
                      <MineTenureInfo mine={mine} {...this.props} />
                    </div>
                  </TabPane>
                )}
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
            </div> */}
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
  // approvedVariances: getApprovedVariances(state),
  // varianceApplications: getVarianceApplications(state),
  // complianceCodes: getDropdownHSRCMComplianceCodes(state),
  // multiSelectComplianceCodes: getMultiSelectComplianceCodes(state),
  // complianceCodesHash: getHSRCMComplianceCodesHash(state),
  // mineComplianceInfo: getMineComplianceInfo(state),
  // inspectors: getDropdownInspectors(state),
  // varianceStatusOptions: getDropdownVarianceStatusOptions(state),
  // varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  // inspectorsHash: getInspectorsHash(state),
  userRoles: getUserAccessData(state),
  // varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  // varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
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
      fetchVarianceDocumentCategoryOptions,
      fetchMineReportDefinitionOptions,
      fetchVariancesByMine,
      fetchMineComplianceCodes,
      fetchInspectors,
      fetchMineIncidentFollowActionOptions,
      fetchMineIncidentDeterminationOptions,
      fetchMineIncidentStatusCodeOptions,
      fetchVarianceStatusOptions,
      setMineVerifiedStatus,
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);
