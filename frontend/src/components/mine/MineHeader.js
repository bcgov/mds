import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu, Divider, Button, Dropdown, Tag, Popover, Popconfirm, Tooltip } from "antd";
import MineHeaderMap from "@/components/maps/MineHeaderMap";

import {
  ELLIPSE,
  RED_ELLIPSE,
  BRAND_DOCUMENT,
  EDIT,
  INFO_CIRCLE,
  SUBSCRIBE,
  UNSUBSCRIBE,
  YELLOW_HAZARD,
  SUCCESS_CHECKMARK,
  EDIT_OUTLINE_VIOLET,
} from "@/constants/assets";
import * as route from "@/constants/routes";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import * as String from "@/constants/strings";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import {
  setMineVerifiedStatus,
  fetchMineVerifiedStatuses,
} from "@/actionCreators/mineActionCreator";
import { formatDate } from "@/utils/helpers";
import RefreshButton from "@/components/common/RefreshButton";

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  removeMineType: PropTypes.func.isRequired,
  handleUnSubscribe: PropTypes.func.isRequired,
  subscribed: PropTypes.bool.isRequired,
  handleSubscription: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  setMineVerifiedStatus: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  refreshActions: PropTypes.arrayOf(PropTypes.func),
  refreshListActions: PropTypes.arrayOf(PropTypes.func),
  refreshRequests: PropTypes.arrayOf(PropTypes.func),
};

const defaultProps = {
  refreshActions: [],
  refreshListActions: [],
  refreshRequests: [],
};

export class MineHeader extends Component {
  state = {
    menuVisible: false,
  };

  handleUpdateMineRecord = (value) => {
    const mineStatus = value.mine_status.join(",");
    return this.props
      .updateMineRecord(
        this.props.mine.mine_guid,
        {
          ...value,
          mine_status: mineStatus,
          mineType: this.props.mine.mine_type,
        },
        value.mine_name
      )
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.mine_guid);
      });
  };

  handleDeleteMineType = (event, mineTypeCode) => {
    event.preventDefault();
    this.props.mine.mine_type.forEach((type) => {
      if (type.mine_tenure_type_code === mineTypeCode) {
        const tenure = this.props.mineTenureHash[mineTypeCode];
        this.props.removeMineType(type.mine_type_guid, tenure).then(() => {
          this.props.fetchMineRecordById(this.props.mine.mine_guid);
        });
      }
    });
  };

  handleAddTailings = (values) =>
    this.props.createTailingsStorageFacility(this.props.mine.mine_guid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.mine_guid);
    });

  handleVerifyMineData = (e) => {
    e.stopPropagation();
    this.props.setMineVerifiedStatus(this.props.mine.mine_guid, { healthy: true }).then(() => {
      this.props.fetchMineRecordById(this.props.mine.mine_guid);
      this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
      this.handleMenuClick();
    });
  };

  handleUnverifyMineData = (e) => {
    e.stopPropagation();
    this.props.setMineVerifiedStatus(this.props.mine.mine_guid, { healthy: false }).then(() => {
      this.props.fetchMineRecordById(this.props.mine.mine_guid);
      this.props.fetchMineVerifiedStatuses(`idir\\${this.props.userInfo.preferred_username}`);
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

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  openModal(event, onSubmit, handleDelete, title, mine) {
    event.preventDefault();
    const initialValues = {
      mine_name: mine.mine_name,
      latitude: mine.mine_location ? mine.mine_location.latitude : null,
      longitude: mine.mine_location ? mine.mine_location.longitude : null,
      mine_status: mine.mine_status[0] ? mine.mine_status[0].status_values : null,
      status_date: mine.mine_status[0] ? mine.mine_status[0].status_date : null,
      major_mine_ind: mine.major_mine_ind ? mine.major_mine_ind : false,
      mine_region: mine.mine_region,
      mine_note: mine.mine_note,
    };
    this.props.openModal({
      props: {
        onSubmit,
        handleDelete,
        title,
        initialValues,
      },
      content: modalConfig.MINE_RECORD,
      clearOnSubmit: false,
    });
  }

  render() {
    const menu = (
      <Menu>
        <AuthorizationWrapper
          permission={Permission.EDIT_MINES}
          isMajorMine={this.props.mine.major_mine_ind}
        >
          <Menu.Item onClick={this.handleMenuClick}>
            <div className="custom-menu-item">
              <button
                type="button"
                className="full"
                onClick={(event) =>
                  this.openModal(
                    event,
                    this.handleUpdateMineRecord,
                    this.handleDeleteMineType,
                    ModalContent.UPDATE_MINE_RECORD,
                    this.props.mine
                  )
                }
              >
                <img alt="pencil" className="padding-small" src={EDIT_OUTLINE_VIOLET} />
                {ModalContent.UPDATE_MINE_RECORD}
              </button>
            </div>
          </Menu.Item>
        </AuthorizationWrapper>
        <AuthorizationWrapper
          permission={Permission.EDIT_MINES}
          isMajorMine={this.props.mine.major_mine_ind}
        >
          <Menu.Item onClick={this.handleMenuClick}>
            <div className="custom-menu-item">
              <button
                type="button"
                className="full"
                onClick={(event) =>
                  this.openTailingsModal(event, this.handleAddTailings, ModalContent.ADD_TAILINGS)
                }
              >
                <img alt="document" className="padding-small" src={BRAND_DOCUMENT} />
                {ModalContent.ADD_TAILINGS}
              </button>
            </div>
          </Menu.Item>
        </AuthorizationWrapper>
        {this.props.subscribed ? (
          <div className="custom-menu-item">
            <Popconfirm
              placement="left"
              title="Are you sure you want to unsubscribe?"
              onConfirm={this.props.handleUnSubscribe}
              okText="Yes"
              cancelText="No"
            >
              <button type="button" className="full">
                <img alt="document" className="padding-small" src={UNSUBSCRIBE} />
                Unsubscribe
              </button>
            </Popconfirm>
          </div>
        ) : (
          <div className="custom-menu-item">
            <button type="button" className="full" onClick={this.props.handleSubscription}>
              <img alt="document" className="padding-small" src={SUBSCRIBE} />
              Subscribe
            </button>
          </div>
        )}

        <AuthorizationWrapper permission={Permission.ADMIN}>
          {this.props.mine.verified_status.healthy_ind !== true && (
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
                  Verify Mine Data
                </button>
              </Popconfirm>
            </div>
          )}
          {this.props.mine.verified_status.healthy_ind !== false && (
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
                  Mark Data for Verification
                </button>
              </Popconfirm>
            </div>
          )}
        </AuthorizationWrapper>
      </Menu>
    );

    const mapRoute = this.props.mine.mine_location
      ? route.MINE_HOME_PAGE.mapRoute({
          lat: this.props.mine.mine_location.latitude,
          long: this.props.mine.mine_location.longitude,
          zoom: String.HIGH_ZOOM,
          mineName: this.props.mine.mine_name,
        })
      : route.MINE_HOME_PAGE.mapRoute();

    return (
      <div className="dashboard__header--card">
        <div className="dashboard__header--card__content">
          <div className="inline-flex between center-mobile">
            <h1>
              {this.props.mine.mine_name}
              {this.props.mine.verified_status.healthy_ind !== null && (
                <img
                  alt=""
                  className="padding-small"
                  src={
                    this.props.mine.verified_status.healthy_ind ? SUCCESS_CHECKMARK : YELLOW_HAZARD
                  }
                  title={
                    this.props.mine.verified_status.healthy_ind
                      ? `Mine data verified by ${
                          this.props.mine.verified_status.verifying_user
                        } on ${formatDate(this.props.mine.verified_status.verifying_timestamp)}`
                      : "Please double-check this mine's data and re-verify"
                  }
                  width="45"
                />
              )}
            </h1>
            <div>
              {this.props.subscribed && (
                <Tooltip title="Subscribed" placement="top" mouseEnterDelay={1}>
                  <img src={SUBSCRIBE} alt="SUBSCRIBE" />
                </Tooltip>
              )}
              {// TODO: Unhide when new nav is done
              true ? (
                <div />
              ) : (
                <RefreshButton
                  actions={this.props.refreshActions}
                  listActions={this.props.refreshListActions}
                  requests={this.props.refreshRequests}
                />
              )}
              <Dropdown
                className="full-height full-mobile"
                overlay={menu}
                placement="bottomLeft"
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.menuVisible}
              >
                <Button type="primary">
                  <div className="padding-small">
                    <img className="padding-small--right" src={EDIT} alt="Add/Edit" />
                    Add/Edit
                  </div>
                </Button>
              </Dropdown>
            </div>
          </div>
          <Divider className="custom-large-divider" />
          <div className="inline-flex between block-mobile">
            <div className="inline-flex padding-small">
              <p className="field-title">Mine No. </p>
              <p> {this.props.mine.mine_no} </p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Mine Class </p>
              <p>{this.props.mine.major_mine_ind ? String.MAJOR_MINE : String.REGIONAL_MINE}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">TSF</p>
              <p>
                {this.props.mine.mine_tailings_storage_facilities.length > 0
                  ? this.props.mine.mine_tailings_storage_facilities.length
                  : String.EMPTY_FIELD}
              </p>
            </div>
          </div>
          {this.props.mine.mine_status[0] && (
            <div>
              <div className="inline-flex padding-small">
                <p className="field-title">Operating Status </p>
                <img
                  alt="status"
                  className="dashboard__header--card__content--status__img"
                  src={
                    this.props.mine.mine_status[0].status_values[0] === "OP" ? ELLIPSE : RED_ELLIPSE
                  }
                />
                {this.props.mine.mine_status[0] ? (
                  <p>{this.props.mine.mine_status[0].status_labels.join(", ")}</p>
                ) : (
                  <p>{String.EMPTY_FIELD}</p>
                )}
                {this.props.mine.mine_status[0] && (
                  <img
                    alt="info"
                    className="dashboard__header--card__content--status__img"
                    src={INFO_CIRCLE}
                    style={{ marginLeft: 5 }}
                    title={this.props.mine.mine_status[0].status_description}
                  />
                )}
              </div>

              <div className="inline-flex padding-small">
                <p className="field-title">Status Since </p>

                {this.props.mine.mine_status[0].status_date ? (
                  formatDate(this.props.mine.mine_status[0].status_date)
                ) : (
                  <p>Not Entered</p>
                )}
              </div>
            </div>
          )}
          {!this.props.mine.mine_status[0] && (
            <div className="inline-flex padding-small">
              <p className="field-title">Operating Status</p>
              <p>{String.EMPTY_FIELD}</p>
            </div>
          )}
          <div className="inline-flex padding-small">
            <p className="field-title">Tenure</p>
            <div>
              {this.props.transformedMineTypes.mine_tenure_type_code.length > 0 ? (
                this.props.transformedMineTypes.mine_tenure_type_code.map((tenure) => (
                  <span className="mine_tenure" key={tenure}>
                    {this.props.mineTenureHash[tenure]}
                  </span>
                ))
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
            </div>
          </div>
          <div className="inline-flex padding-small wrap">
            <p className="field-title">Commodity</p>
            {this.props.transformedMineTypes.mine_commodity_code.length > 0 ? (
              this.props.transformedMineTypes.mine_commodity_code.map((code) => (
                <Tag key={code}>{this.props.mineCommodityOptionsHash[code]}</Tag>
              ))
            ) : (
              <p>{String.EMPTY_FIELD}</p>
            )}
          </div>
          <div className="inline-flex padding-small wrap">
            <p className="field-title">Disturbance</p>
            {this.props.transformedMineTypes.mine_disturbance_code.length > 0 ? (
              this.props.transformedMineTypes.mine_disturbance_code.map((code) => (
                <Tag key={code}>{this.props.mineDisturbanceOptionsHash[code]}</Tag>
              ))
            ) : (
              <p>{String.EMPTY_FIELD}</p>
            )}
          </div>
          <div className="inline-flex padding-small wrap">
            <p className="field-title">Notes</p>
            <div>
              {this.props.mine.mine_note ? (
                <Popover
                  content={this.props.mine.mine_note}
                  overlayStyle={{ width: "50%", padding: "20px" }}
                  title="Mine Notes"
                  trigger="click"
                >
                  <Button ghost style={{ padding: 0, margin: 0, height: 0 }}>
                    View Notes{" "}
                    <img
                      alt="info"
                      className="padding-small"
                      src={INFO_CIRCLE}
                      style={{ padding: 0, margin: 0 }}
                    />
                  </Button>
                </Popover>
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
            </div>
          </div>
        </div>
        <div className="dashboard__header--card__map">
          <MineHeaderMap mine={this.props.mine} />
          <div className="dashboard__header--card__map--footer">
            <div className="inline-flex between">
              <p className="p-white">
                Lat:{" "}
                {this.props.mine.mine_location
                  ? this.props.mine.mine_location.latitude
                  : String.EMPTY_FIELD}
              </p>
              <p className="p-white">
                Long:{" "}
                {this.props.mine.mine_location
                  ? this.props.mine.mine_location.longitude
                  : String.EMPTY_FIELD}
              </p>
            </div>
            <div className="inline-flex between">
              <p className="p-white">
                Region:{" "}
                {this.props.mine.mine_region
                  ? this.props.mineRegionHash[this.props.mine.mine_region]
                  : String.EMPTY_FIELD}
              </p>
              <Link className="link-on-dark" to={mapRoute} target="_blank">
                View In Full Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setMineVerifiedStatus,
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineHeader);
