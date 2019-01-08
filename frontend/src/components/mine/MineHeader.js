import React, { Component } from "react";
import PropTypes from "prop-types";
import MineMap from "@/components/maps/MineMap";
import { Menu, Icon, Divider, Button, Popover } from "antd";
import { ELLIPSE, BRAND_PENCIL, RED_ELLIPSE, BRAND_DOCUMENT, EDIT } from "@/constants/assets";
import * as String from "@/constants/strings";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { ConditionalButton } from "../common/ConditionalButton";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  removeMineType: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

class MineHeader extends Component {
  handleUpdateMineRecord = (value) => {
    const mineStatus = value.mine_status.join(",");
    this.props
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

  handleAddTailings = (value) => {
    this.props
      .createTailingsStorageFacility({
        ...value,
        mine_guid: this.props.mine.guid,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  createMineTypePopUp = (mineTypes) =>
    mineTypes.map((type) => (
      <div key={type.mine_type_guid}>
        <p className="bold">{this.props.mineTenureHash[type.mine_tenure_type_code]}</p>
        <Divider style={{ margin: "0", marginBottom: "5px", backgroundColor: "#404040" }} />
        <div className="inline-flex">
          <div>
            <p>Commodity:</p>
          </div>
          <div>
            {type.mine_type_detail &&
              type.mine_type_detail.map(({ mine_commodity_code }) => (
                <span>
                  {mine_commodity_code &&
                    `${this.props.mineCommodityOptionsHash[mine_commodity_code]}, `}
                </span>
              ))}
          </div>
        </div>
        <div className="inline-flex">
          <div>
            <p>Disturbance:</p>
          </div>
          <div>
            {type.mine_type_detail &&
              type.mine_type_detail.map(({ mine_disturbance_code }) => (
                <span>
                  {mine_disturbance_code &&
                    `${this.props.mineDisturbanceOptionsHash[mine_disturbance_code]}, `}
                </span>
              ))}
          </div>
        </div>
      </div>
    ));

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
      latitude: mine.mine_location[0] ? mine.mine_location[0].latitude : null,
      longitude: mine.mine_location[0] ? mine.mine_location[0].longitude : null,
      mine_status: mine.mine_status[0] ? mine.mine_status[0].status_values : null,
      major_mine_ind: mine.major_mine_ind ? mine.major_mine_ind : false,
      mine_region: mine.region_code ? mine.region_code : null,
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
      </Menu>
    );
    return (
      <div className="dashboard__header--card">
        <div className="dashboard__header--card__content">
          <div className="inline-flex between">
            <h1>{this.props.mine.mine_name} </h1>
            <ConditionalButton
              isDropdown
              overlay={menu}
              string={
                <div className="padding-small">
                  <img className="padding-small--right" src={EDIT} alt="Add/Edit" />
                  Add/Edit
                </div>
              }
            />
          </div>
          <Divider />
          <h5>Mine No.: {this.props.mine.mine_no} </h5>
          {this.props.mine.mine_status[0] && (
            <div className="inline-flex">
              <div>
                <h5>Operating Status: </h5>
              </div>
              <div>
                <img
                  alt="status"
                  src={
                    this.props.mine.mine_status[0].status_values[0] === "OP" ? ELLIPSE : RED_ELLIPSE
                  }
                />
              </div>
              <div>
                <h5>
                  {this.props.mine.mine_status[0].status_labels.map((label, i) => (
                    <span className="mine__status" key={i}>
                      {label}
                    </span>
                  ))}
                </h5>
              </div>
            </div>
          )}
          {!this.props.mine.mine_status[0] && (
            <div>
              <h5>
                Operating Status:
                {String.EMPTY_FIELD}
              </h5>
            </div>
          )}
          <h5>
            Tenure:{" "}
            {this.props.mine.mine_type[0] ? (
              <Popover
                style={{ widht: "400px", backgroundColor: "white" }}
                content={this.createMineTypePopUp(this.props.mine.mine_type)}
                placement="bottomRight"
                trigger="click"
              >
                <Button className="btn--dropdown">
                  {this.props.mine.mine_type.map((tenure) => (
                    <span className="mine_tenure" key={tenure.mine_tenure_type_guid}>
                      {this.props.mineTenureHash[tenure.mine_tenure_type_code]}
                    </span>
                  ))}
                  <Icon type="down" style={{ fontSize: "14px" }} />
                </Button>
              </Popover>
            ) : (
              String.EMPTY_FIELD
            )}
          </h5>
          <h5>{this.props.mine.major_mine_ind ? String.MAJOR_MINE : String.REGIONAL_MINE}</h5>
          <h5>
            TSF:{" "}
            {this.props.mine.mine_tailings_storage_facility.length > 0
              ? this.props.mine.mine_tailings_storage_facility.length
              : String.EMPTY_FIELD}
          </h5>
        </div>
        <div className="dashboard__header--card__map">
          <MineMap mine={this.props.mine} />
          <div className="dashboard__header--card__map--footer">
            <div className="inline-flex between">
              <p className="p-white">
                Lat:{" "}
                {this.props.mine.mine_location[0]
                  ? this.props.mine.mine_location[0].latitude
                  : String.EMPTY_FIELD}
              </p>
              <p className="p-white">
                Long:{" "}
                {this.props.mine.mine_location[0]
                  ? this.props.mine.mine_location[0].longitude
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

MineHeader.propTypes = propTypes;

export default MineHeader;
