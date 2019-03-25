import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import MineMap from "@/components/maps/MineMap";
import { Menu, Divider, Button, Dropdown, Tag, Popover, Popconfirm } from "antd";
import {
  ELLIPSE,
  BRAND_PENCIL,
  RED_ELLIPSE,
  BRAND_DOCUMENT,
  EDIT,
  INFO_CIRCLE,
  YELLOW_HAZARD,
  SUCCESS_CHECKMARK,
} from "@/constants/assets";
import { getUserInfo, getKeycloak } from "@/selectors/authenticationSelectors";
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

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  removeMineType: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  setMineVerifiedStatus: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.strings)).isRequired,
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

export class MineHeader extends Component {
  handleUpdateMineRecord = (value) => {
    const mineStatus = value.mine_status.join(",");
    return this.props
      .updateMineRecord(
        this.props.mine.guid,
        { ...value, mine_status: mineStatus, mineType: this.props.mine.mine_type },
        value.name
      )
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  handleDeleteMineType = (event, mineTypeCode) => {
    event.preventDefault();
    this.props.mine.mine_type.map((type) => {
      if (type.mine_tenure_type_code === mineTypeCode) {
        const tenure = this.props.mineTenureHash[mineTypeCode];
        this.props.removeMineType(type.mine_type_guid, tenure).then(() => {
          this.props.fetchMineRecordById(this.props.mine.guid);
        });
      }
    });
  };

  handleAddTailings = (value) =>
    this.props
      .createTailingsStorageFacility({
        ...value,
        mine_guid: this.props.mine.guid,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });

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
      name: mine.mine_name ? mine.mine_name : null,
      latitude: mine.mine_location ? mine.mine_location.latitude : null,
      longitude: mine.mine_location ? mine.mine_location.longitude : null,
      mine_status: mine.mine_status[0] ? mine.mine_status[0].status_values : null,
      major_mine_ind: mine.major_mine_ind ? mine.major_mine_ind : false,
      mine_region: mine.region_code ? mine.region_code : null,
      note: mine.mine_note ? mine.mine_note : null,
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
        <Menu.Item key="0">
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
            <img alt="pencil" className="padding-small" src={BRAND_PENCIL} />
            {ModalContent.UPDATE_MINE_RECORD}
          </button>
        </Menu.Item>
        <Menu.Item key="1">
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
        </Menu.Item>

        <AuthorizationWrapper inTesting>
          {(!this.props.mine.verified_status || !this.props.mine.verified_status.healthy) && (
            <Menu.Item key="2">
              <Popconfirm
                placement="left"
                title="Are you sure?"
                onConfirm={() => {
                  this.props.setMineVerifiedStatus(this.props.mine.guid, true).then(() => {
                    this.props.fetchMineRecordById(this.props.mine.guid);
                    this.props.fetchMineVerifiedStatuses(
                      `idir\\${this.props.userInfo.preferred_username}`
                    );
                  });
                }}
                okText="Yes"
                cancelText="No"
              >
                <button type="button" className="full" onClick={(e) => e.stopPropagation()}>
                  <img
                    alt="checkmark"
                    className="padding-small"
                    src={SUCCESS_CHECKMARK}
                    width="30"
                  />
                  Verify Mine Data
                </button>
              </Popconfirm>
            </Menu.Item>
          )}
        </AuthorizationWrapper>
        <AuthorizationWrapper inTesting>
          {(!this.props.mine.verified_status || this.props.mine.verified_status.healthy) && (
            <Menu.Item key="3">
              <Popconfirm
                placement="left"
                title="Are you sure?"
                onConfirm={() =>
                  this.props.setMineVerifiedStatus(this.props.mine.guid, false).then(() => {
                    this.props.fetchMineRecordById(this.props.mine.guid);
                    this.props.fetchMineVerifiedStatuses(
                      `idir\\${this.props.userInfo.preferred_username}`
                    );
                  })
                }
                okText="Yes"
                cancelText="No"
              >
                <button type="button" className="full" onClick={(e) => e.stopPropagation()}>
                  <img alt="hazard" className="padding-small" src={YELLOW_HAZARD} width="30" />
                  Mark Data for Verification
                </button>
              </Popconfirm>
            </Menu.Item>
          )}
        </AuthorizationWrapper>
      </Menu>
    );

    if (this.props.mine.verified_status) {
      this.healthy = this.props.mine.verified_status.healthy;
    }

    return (
      <div className="dashboard__header--card">
        <div className="dashboard__header--card__content">
          <div className="inline-flex between center-mobile">
            <h1>
              {this.props.mine.mine_name}{" "}
              {this.props.mine.verified_status && (
                <img
                  alt=""
                  className="padding-small"
                  src={this.healthy ? SUCCESS_CHECKMARK : YELLOW_HAZARD}
                  title={
                    this.healthy
                      ? `Mine data verified by ${
                          this.props.mine.verified_status.verifying_user
                        } on ${formatDate(this.props.mine.verified_status.verifying_timestamp)}`
                      : "Please double-check this mine's data and re-verify"
                  }
                  width="45"
                />
              )}
            </h1>
            <AuthorizationWrapper
              permission={Permission.CREATE}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
                <Button type="primary">
                  <div className="padding-small">
                    <img className="padding-small--right" src={EDIT} alt="Add/Edit" />
                    Add/Edit
                  </div>
                </Button>
              </Dropdown>
            </AuthorizationWrapper>
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
                {this.props.mine.mine_tailings_storage_facility.length > 0
                  ? this.props.mine.mine_tailings_storage_facility.length
                  : String.EMPTY_FIELD}
              </p>
            </div>
          </div>
          {this.props.mine.mine_status[0] && (
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
                this.props.mine.mine_status[0].status_labels.map((label) => (
                  <p className="mine__status" key={label}>
                    {label}
                  </p>
                ))
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
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
            <p>
              {this.props.transformedMineTypes.mine_tenure_type_code.length > 0 ? (
                this.props.transformedMineTypes.mine_tenure_type_code.map((tenure) => (
                  <span className="mine_tenure" key={tenure}>
                    {this.props.mineTenureHash[tenure]}
                  </span>
                ))
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
            </p>
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
          <MineMap mine={this.props.mine} />
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
            <p className="p-white">
              Region:{" "}
              {this.props.mine.region_code
                ? this.props.mineRegionHash[this.props.mine.region_code]
                : String.EMPTY_FIELD}
            </p>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineHeader);
