import React, { Component } from "react";
import { bindActionCreators } from "redux";
// import { getFormValues, getFormSyncErrors } from "redux-form";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { uniqBy } from "lodash";
import PropTypes from "prop-types";
import { Menu, Divider, Button, Dropdown, Tag, Popover } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  updateMineRecord,
  createMineTypes,
  removeMineType,
  fetchMineRecordById,
  createTailingsStorageFacility,
  createMineAlert,
  updateMineAlert,
  fetchMineAlertByMine,
  deleteMineAlert,
} from "@common/actionCreators/mineActionCreator";
import { formatDate } from "@common/utils/helpers";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getExemptionFeeStatusOptionsHash,
  getGovernmentAgencyHash,
} from "@common/selectors/staticContentSelectors";
import { getCurrentMineTypes, getTransformedMineTypes } from "@common/selectors/mineSelectors";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import * as String from "@common/constants/strings";
import MineHeaderMapLeaflet from "@/components/maps/MineHeaderMapLeaflet";
import { EDIT_OUTLINE_VIOLET, EDIT, OPEN_NEW_TAB } from "@/constants/assets";
import * as route from "@/constants/routes";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import MineAlert from "@/components/mine/MineAlert";
// import * as FORM from "@/constants/forms";

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  createMineTypes: PropTypes.func.isRequired,
  removeMineType: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  exemptionFeeStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  governmentAgencyHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const generateEmliInspectionMapperUrl = (lat, lng) => {
  const formattedLat = parseFloat(lat);
  const formattedLng = parseFloat(lng);
  const coordinateString = encodeURIComponent(`${formattedLng},${formattedLat}`);
  return `${String.EMLI_INSPECTION_MAPPER_BASE_URL}&center=${coordinateString}&level=10`;
};

export class MineHeader extends Component {
  handleUpdateMineRecord = (value) => {
    const mineStatus = value.mine_status.join(",");
    return this.props
      .updateMineRecord(
        this.props.mine.mine_guid,
        {
          ...value,
          mine_status: mineStatus,
        },
        value.mine_name
      )
      .then(() => {
        this.props.createMineTypes(this.props.mine.mine_guid, value.mine_types).then(() => {
          this.props.closeModal();
          this.props.fetchMineRecordById(this.props.mine.mine_guid);
        });
      });
  };

  handleDeleteMineType = (event, mineTypeCode) => {
    event.preventDefault();
    this.props.mine.mine_type.forEach((type) => {
      if (type.mine_tenure_type_code === mineTypeCode) {
        const tenure = this.props.mineTenureHash[mineTypeCode];
        this.props
          .removeMineType(this.props.mine.mine_guid, type.mine_type_guid, tenure)
          .then(() => {
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
      exemption_fee_status_code: mine.exemption_fee_status_code,
      exemption_fee_status_note: mine.exemption_fee_status_note,
      government_agency_type_code: mine.government_agency_type_code,
      number_of_mine_employees: mine.number_of_mine_employees ?? null,
      number_of_contractors: mine.number_of_contractors ?? null,
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
        <Menu.Item>
          <button
            id="updateMine"
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
            <img alt="pencil" className="padding-sm" src={EDIT_OUTLINE_VIOLET} />
            {ModalContent.UPDATE_MINE_RECORD}
          </button>
        </Menu.Item>
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
          <MineAlert mine={this.props.mine} />
          <br />
          <div className="inline-flex between horizontal-center">
            <h4>Mine Details</h4>
            <div>
              <AuthorizationWrapper permission={Permission.EDIT_MINES}>
                <Dropdown className="full-height" overlay={menu} placement="bottomLeft">
                  <Button type="primary">
                    <div className="padding-sm">
                      <img className="padding-sm--right" src={EDIT} alt="Add/Edit" />
                      Add/Edit
                    </div>
                  </Button>
                </Dropdown>
              </AuthorizationWrapper>
            </div>
          </div>
          <Divider style={{ margin: "0" }} />

          {this.props.mine.mine_status[0] && (
            <div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Operating Status </p>
                {this.props.mine.mine_status[0] ? (
                  <p>{this.props.mine.mine_status[0].status_labels.join(", ")}</p>
                ) : (
                  <p>{String.EMPTY_FIELD}</p>
                )}
                {this.props.mine.mine_status[0] && (
                  <CoreTooltip title={this.props.mine.mine_status[0].status_description} />
                )}
              </div>

              <div className="inline-flex padding-sm">
                <p className="field-title">Status Since </p>

                {this.props.mine.mine_status[0].status_date ? (
                  formatDate(this.props.mine.mine_status[0].status_date)
                ) : (
                  <p>{String.EMPTY_FIELD}</p>
                )}
              </div>
            </div>
          )}
          {!this.props.mine.mine_status[0] && (
            <div className="inline-flex padding-sm">
              <p className="field-title">Operating Status</p>
              <p>{String.EMPTY_FIELD}</p>
            </div>
          )}
          <div className="inline-flex padding-sm">
            <p className="field-title">Mine Class </p>
            <p>{this.props.mine.major_mine_ind ? String.MAJOR_MINE : String.REGIONAL_MINE}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Tenure</p>
            <div>
              <p>
                {this.props.transformedMineTypes?.mine_tenure_type_code.length > 0
                  ? uniqBy(this.props.transformedMineTypes.mine_tenure_type_code)
                      .map((tenure) => this.props.mineTenureHash[tenure])
                      .join(", ")
                  : String.EMPTY_FIELD}
              </p>
            </div>
          </div>
          <div className="inline-flex padding-sm wrap">
            <p className="field-title">Commodity</p>
            {this.props.transformedMineTypes.mine_commodity_code.length > 0 ? (
              uniqBy(this.props.transformedMineTypes.mine_commodity_code).map((code) => (
                <Tag key={code}>{this.props.mineCommodityOptionsHash[code]}</Tag>
              ))
            ) : (
              <p>{String.EMPTY_FIELD}</p>
            )}
          </div>
          <div className="inline-flex padding-sm wrap">
            <p className="field-title">Disturbance</p>
            {this.props.transformedMineTypes.mine_disturbance_code.length > 0 ? (
              uniqBy(this.props.transformedMineTypes.mine_disturbance_code).map((code) => (
                <Tag key={code}>{this.props.mineDisturbanceOptionsHash[code]}</Tag>
              ))
            ) : (
              <p>{String.EMPTY_FIELD}</p>
            )}
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">TSF</p>
            <p>
              {this.props.mine.mine_tailings_storage_facilities.length > 0 ? (
                <Link to={route.MINE_TAILINGS.dynamicRoute(this.props.mine.mine_guid)}>
                  {this.props.mine.mine_tailings_storage_facilities.length}
                </Link>
              ) : (
                String.EMPTY_FIELD
              )}
            </p>
          </div>
          <div className="inline-flex padding-sm wrap">
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
                    View Notes <CoreTooltip />
                  </Button>
                </Popover>
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
            </div>
          </div>
          <div className="inline-flex padding-sm wrap">
            <p className="field-title">Legacy Alias</p>
            <p>{this.props.mine.mms_alias ? this.props.mine.mms_alias : String.EMPTY_FIELD}</p>
          </div>
          {this.props.mine.government_agency_type_code && (
            <>
              <div className="inline-flex padding-sm wrap">
                <p className="field-title">Exemption Status</p>
                <div>
                  {this.props.mine.exemption_fee_status_code
                    ? this.props.exemptionFeeStatusOptionsHash[
                        this.props.mine.exemption_fee_status_code
                      ]
                    : String.EMPTY_FIELD}
                  {this.props.mine.exemption_fee_status_note && (
                    <CoreTooltip title={this.props.mine.exemption_fee_status_note} />
                  )}
                </div>
              </div>

              <div className="inline-flex padding-sm wrap">
                <p className="field-title">Government Agency type</p>
                <div>
                  {this.props.governmentAgencyHash[this.props.mine.government_agency_type_code]}
                </div>
              </div>
            </>
          )}
          <div className="inline-flex padding-sm wrap">
            <div className="field-title">Number of Mine Employees</div>
            <div>{this.props.mine.number_of_mine_employees || String.EMPTY_FIELD}</div>
            <CoreTooltip title="Approximate number of mine employees on site" />
          </div>
          <div className="inline-flex padding-sm wrap">
            <div className="field-title">Number of Contractors</div>
            <div>{this.props.mine.number_of_contractors || String.EMPTY_FIELD}</div>
            <CoreTooltip title="Approximate number of contractors on site" />
          </div>
          {this.props.mine.mine_location?.latitude && this.props.mine.mine_location?.longitude && (
            <div className="inline-flex padding-sm wrap">
              <div className="field-title">View on the EMLI Inspection Mapper</div>
              <div>
                <a
                  href={generateEmliInspectionMapperUrl(
                    this.props.mine.mine_location?.latitude,
                    this.props.mine.mine_location?.longitude
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    alt="Open link in new window"
                    src={OPEN_NEW_TAB}
                    style={{ width: "1.25em" }}
                  />
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="dashboard__header--card__map">
          <MineHeaderMapLeaflet mine={this.props.mine} />
          <div className="dashboard__header--card__map--footer">
            <div className="inline-flex between">
              <p className="p-white">
                Lat:&nbsp;
                {this.props.mine.mine_location && this.props.mine.mine_location.latitude
                  ? this.props.mine.mine_location.latitude
                  : String.EMPTY_FIELD}
              </p>
              <p className="p-white">
                Long:&nbsp;
                {this.props.mine.mine_location && this.props.mine.mine_location.longitude
                  ? this.props.mine.mine_location.longitude
                  : String.EMPTY_FIELD}
              </p>
            </div>
            <div className="inline-flex between">
              <p className="p-white">
                Region:&nbsp;
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
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  currentMineTypes: getCurrentMineTypes(state),
  transformedMineTypes: getTransformedMineTypes(state),
  exemptionFeeStatusOptionsHash: getExemptionFeeStatusOptionsHash(state),
  governmentAgencyHash: getGovernmentAgencyHash(state),
  // mineAlerts: getMineAlerts(state),
  // formValues: getFormValues(FORM.ADD_EDIT_MINE_ALERT)(state),
  // formErrors: getFormSyncErrors(FORM.ADD_EDIT_MINE_ALERT)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateMineRecord,
      createMineTypes,
      removeMineType,
      fetchMineRecordById,
      createTailingsStorageFacility,
      fetchMineAlertByMine,
      updateMineAlert,
      deleteMineAlert,
      createMineAlert,
    },
    dispatch
  );

MineHeader.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineHeader);
