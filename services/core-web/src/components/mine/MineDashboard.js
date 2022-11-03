import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { isFuture } from "date-fns";
import { Menu, Button, Dropdown, Popconfirm, Tooltip, Drawer } from "antd";
import {
  DownOutlined,
  MessageOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
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
} from "@common/actionCreators/mineActionCreator";
import {
  fetchPartyRelationships,
  fetchAllPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import { fetchVariancesByMine } from "@common/actionCreators/varianceActionCreator";
import { fetchNoticesOfDeparture } from "@common/actionCreators/noticeOfDepartureActionCreator";
import { fetchMineComplianceInfo } from "@common/actionCreators/complianceActionCreator";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import { getMines, getIsUserSubscribed } from "@common/selectors/mineSelectors";
import { formatDate } from "@common/utils/helpers";
import { storeVariances } from "@common/actions/varianceActions";
import { storePermits } from "@common/actions/permitActions";
import { storeMine } from "@common/actions/mineActions";
import * as Strings from "@common/constants/strings";
import { detectProdEnvironment } from "@common/utils/environmentUtils";
import { fetchMineNoticeOfWorkApplications } from "@common/actionCreators/noticeOfWorkActionCreator";
import { fetchExplosivesPermits } from "@common/actionCreators/explosivesPermitActionCreator";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import MineNavigation from "@/components/mine/MineNavigation";
import Loading from "@/components/common/Loading";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import MineDashboardRoutes from "@/routes/MineDashboardRoutes";
import {
  SUBSCRIBE,
  UNSUBSCRIBE,
  YELLOW_HAZARD,
  SUCCESS_CHECKMARK,
  MINESPACE_ICON,
} from "@/constants/assets";
import RefreshButton from "@/components/common/buttons/RefreshButton";
import * as router from "@/constants/routes";
import MineComments from "@/components/mine/MineComments";
import { CoreTooltip } from "@/components/common/CoreTooltip";

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
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchAllPartyRelationships: PropTypes.func.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  fetchMineNoticeOfWorkApplications: PropTypes.func.isRequired,
  setMineVerifiedStatus: PropTypes.func.isRequired,
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  fetchExplosivesPermits: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationships: [],
};

const hasDAMRole = (partyRelationships) => {
  return partyRelationships.reduce((acc, pr) => {
    const endDate = pr.end_date ? new Date(pr.end_date) : null;
    if (pr.mine_party_appt_type_code === "DAM" && (!endDate || isFuture(endDate))) {
      acc = true;
    }
    return acc;
  }, false);
};

const hasCCSRole = (partyRelationships) => {
  return partyRelationships.reduce((acc, pr) => {
    const endDate = pr.end_date ? new Date(pr.end_date) : null;
    if (pr.mine_party_appt_type_code === "CCS" && (!endDate || isFuture(endDate))) {
      acc = true;
    }
    return acc;
  }, false);
};

export class MineDashboard extends Component {
  state = {
    menuVisible: false,
    isLoaded: false,
    activeNavButton: "mine-information",
    openSubMenuKey: ["general"],
    isDrawerVisible: false,
  };

  componentWillMount() {
    const { id } = this.props.match.params;
    this.handleActiveButton(this.props.location.pathname);
    this.loadMineData(id);
    this.props.fetchSubscribedMinesByUser();
    this.props.fetchMineNoticeOfWorkApplications({ mine_guid: id });
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

  toggleDrawer = () => {
    this.setState((prevState) => ({ isDrawerVisible: !prevState.isDrawerVisible }));
    this.handleMenuClick();
  };

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
      this.props.fetchPermits(mine.mine_guid);
      this.props.fetchExplosivesPermits(mine.mine_guid);
      this.props.fetchMineComplianceInfo(mine.mine_no, true);
      this.props.fetchAllPartyRelationships({
        mine_guid: id,
        relationships: "party",
        include_permit_contacts: "true",
        active_only: "false",
      });
      this.props
        .fetchPartyRelationships({
          mine_guid: id,
          relationships: "party",
          include_permit_contacts: "true",
        })
        .then(() => {
          this.setState({ isLoaded: true });
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
        <div className="custom-menu-item">
          <button type="button" className="full" onClick={this.toggleDrawer}>
            <MessageOutlined className="padding-sm icon-sm" />
            Communication
          </button>
        </div>
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
                <img alt="document" className="padding-sm" src={UNSUBSCRIBE} />
                Unsubscribe from mine
              </button>
            </Popconfirm>
          </div>
        ) : (
          <div className="custom-menu-item">
            <button type="button" className="full" onClick={this.handleSubscription}>
              <img alt="document" className="padding-sm" src={SUBSCRIBE} />
              Subscribe to mine
            </button>
          </div>
        )}
        <div className="custom-menu-item">
          <RefreshButton
            isNestedButton
            actions={[storeMine]}
            listActions={[storeVariances, storePermits]}
            requests={[
              () => this.props.fetchNoticesOfDeparture(id),
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
                  <img alt="checkmark" className="padding-sm" src={SUCCESS_CHECKMARK} width="30" />
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
                  <img alt="hazard" className="padding-sm" src={YELLOW_HAZARD} width="30" />
                  Re-verify mine data
                </button>
              </Popconfirm>
            </div>
          )}
        </AuthorizationWrapper>
        {/* this is an external link to mineSpace, only available to users in production as its a prod URL, not using the AuthWrapper since the admin role overrides the wrapper. */}
        {detectProdEnvironment() && (
          <div className="custom-menu-item no_link_styling">
            <a
              href={router.VIEW_MINESPACE(mine.mine_guid)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={MINESPACE_ICON}
                alt="mineSpace"
                width="30"
                height="30"
                className="padding-sm"
              />
              View on MineSpace
            </a>
          </div>
        )}
      </Menu>
    );

    const DAMRole = hasDAMRole(this.props.partyRelationships);
    const CSSRole = hasCCSRole(this.props.partyRelationships);
    return (
      <div>
        <Drawer
          title={
            <>
              Internal Communication for {mine.mine_name}
              <CoreTooltip title="Anything written in Internal Communications may be requested under FOIPPA. Keep it professional and concise." />
            </>
          }
          placement="right"
          closable={false}
          onClose={this.toggleDrawer}
          visible={this.state.isDrawerVisible}
        >
          <Button ghost className="modal__close" onClick={this.toggleDrawer}>
            <CloseOutlined />
          </Button>
          <MineComments mineGuid={mine.mine_guid} />
        </Drawer>
        {this.state.isLoaded && (
          <div>
            {(DAMRole || CSSRole) && (
              <div className="abandoned-mine">
                <div className="flex items-center">
                  <ExclamationCircleOutlined className="margin-large--right" />
                  <div>
                    <h4>This is an abandoned mine</h4>
                    <p>
                      Contact the{" "}
                      {DAMRole
                        ? "Director of Abandoned Mines"
                        : "Manager, Crown Contaminated Sites"}{" "}
                      for access to this site
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="tab__content dashboard-tab">
              <div className="inline-flex block-mobile between">
                <div className="inline-flex horizontal-center block-tablet">
                  <h1 className="padding-lg--right">{mine.mine_name}</h1>
                  <div id="mine-no">Mine No. {mine.mine_no || Strings.EMPTY_FIELD}</div>

                  {mine.verified_status.healthy_ind !== null && (
                    <Tooltip
                      title={
                        mine.verified_status.healthy_ind
                          ? `Mine data verified by ${
                              mine.verified_status.verifying_user
                            } on ${formatDate(mine.verified_status.verifying_timestamp)}`
                          : "Please double-check this mine's data and re-verify"
                      }
                      placement="top"
                      mouseEnterDelay={1}
                    >
                      <img
                        alt=""
                        className="padding-sm"
                        src={mine.verified_status.healthy_ind ? SUCCESS_CHECKMARK : YELLOW_HAZARD}
                        width="30"
                      />
                    </Tooltip>
                  )}
                  {this.props.subscribed && (
                    <Tooltip title="Subscribed" placement="top" mouseEnterDelay={1}>
                      <img src={SUBSCRIBE} alt="SUBSCRIBE" className="padding-sm" />
                    </Tooltip>
                  )}
                  {mine.has_minespace_users && (
                    <Tooltip
                      title="This mine is registered on MineSpace"
                      placement="top"
                      mouseEnterDelay={1}
                    >
                      <img src={MINESPACE_ICON} alt="mineSpace" width="22" height="22" />
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
                    <DownOutlined />
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
  partyRelationships: getPartyRelationships(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      updateMineRecord,
      createTailingsStorageFacility,
      removeMineType,
      fetchPartyRelationships,
      fetchAllPartyRelationships,
      fetchMineComplianceInfo,
      fetchSubscribedMinesByUser,
      fetchMineNoticeOfWorkApplications,
      unSubscribe,
      subscribe,
      fetchPermits,
      setMineVerifiedStatus,
      fetchMineVerifiedStatuses,
      fetchVariancesByMine,
      fetchNoticesOfDeparture,
      fetchExplosivesPermits,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;
MineDashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
