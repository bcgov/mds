import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { Menu, Icon, Button, Dropdown, Popconfirm, Tooltip } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { getUserInfo } from "@/selectors/authenticationSelectors";
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
  fetchVarianceDocumentCategoryOptions,
  fetchVarianceStatusOptions,
  fetchMineReportDefinitionOptions,
} from "@/actionCreators/staticContentActionCreator";
import { getMines, getIsUserSubscribed } from "@/selectors/mineSelectors";
import {
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
  fetchInspectors,
} from "@/actionCreators/partiesActionCreator";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import { formatDate } from "@/utils/helpers";
import MineNavigation from "@/components/mine/MineNavigation";
import { storeRegionOptions, storeTenureTypes } from "@/actions/staticContentActions";
import { storeVariances } from "@/actions/varianceActions";
import { storePermits } from "@/actions/permitActions";
import { storeMine } from "@/actions/mineActions";
import MineDashboardRoutes from "@/routes/MineDashboardRoutes";
import { SUBSCRIBE, UNSUBSCRIBE, YELLOW_HAZARD, SUCCESS_CHECKMARK } from "@/constants/assets";
import RefreshButton from "@/components/common/RefreshButton";

/**
 * @class MineDashboard.js is an individual mines dashboard, gets Mine data from redux and passes into children.
 */

const propTypes = {
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  match: CustomPropTypes.match.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string }).isRequired,
  subscribed: PropTypes.bool.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  fetchApplications: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchMineDisturbanceOptions: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  fetchPermitStatusOptions: PropTypes.func.isRequired,
  fetchApplicationStatusOptions: PropTypes.func.isRequired,
  fetchVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  fetchMineReportDefinitionOptions: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  setMineVerifiedStatus: PropTypes.func.isRequired,
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
};

export class MineDashboard extends Component {
  state = {
    menuVisible: false,
    isLoaded: false,
    activeNavButton: "mine-information",
    openSubMenuKey: ["general"],
  };

  componentWillMount() {
    const { id } = this.props.match.params;
    this.handleActiveButton(this.props.location.pathname);
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
    if (this.props.location !== nextProps.location) {
      this.handleActiveButton(nextProps.location.pathname);
    }
  }

  handleActiveButton = (path) => {
    const lastPath = path.split("/").pop();
    this.setState({ activeNavButton: path, openSubMenuKey: [lastPath] });
  };

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
      const mine = this.props.mines[id];
      this.props.fetchApplications({ mine_guid: mine.mine_guid });
      this.props.fetchPermits(mine.mine_guid);
      this.setState({ isLoaded: true });
      this.props.fetchMineComplianceInfo(mine.mine_no, true);
      this.props.fetchPartyRelationships({ mine_guid: id, relationships: "party" });
      this.props.fetchApplications({ mine_guid: id });
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
                  <div id="mine-no">Mine No. {mine.mine_no}</div>
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
            <MineNavigation
              mine={mine}
              activeButton={this.state.activeNavButton}
              openSubMenuKey={this.state.openSubMenuKey}
            />
            <MineDashboardRoutes />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  subscribed: getIsUserSubscribed(state),
  userInfo: getUserInfo(state),
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
      fetchMineComplianceCodes,
      fetchInspectors,
      fetchVarianceStatusOptions,
      setMineVerifiedStatus,
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);
