import React, { Component } from "react";
import PropTypes from "prop-types";
import MineMap from "@/components/maps/MineMap";
import { ELLIPSE, GREEN_PENCIL, RED_ELLIPSE, GREEN_DOCUMENT } from "@/constants/assets";
import { Menu, Icon, Divider, Button, Popover, Col, Row } from "antd";
import * as String from "@/constants/strings";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { ConditionalButton } from "../common/ConditionalButton";

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func,
  createTailingsStorageFacility: PropTypes.func,
  fetchMineRecordById: PropTypes.func,
  mineStatusOptions: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
  mine: PropTypes.object.isRequired,
  mineRegionHash: PropTypes.object.isRequired,
  mineTenureHash: PropTypes.object.isRequired,
  mineTenureTypes: PropTypes.array.isRequired,
};

const defaultProps = {
  mine: {},
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
        <h3>{this.props.mineTenureHash[type.mine_tenure_type_code]}</h3>
        <Divider style={{ margin: "0" }} />
        <Row>
          <Col span={8}>
            <h5>Disturbance:</h5>
          </Col>
          <Col span={16}>
            {type.mine_type_detail &&
              type.mine_type_detail.map(({ mine_disturbance_code }) => {
                return (
                  <span>
                    {mine_disturbance_code &&
                      this.props.mineDisturbanceOptionsHash[mine_disturbance_code]}
                  </span>
                );
              })}
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <h5>Commodity:</h5>
          </Col>
          <Col span={16}>
            {type.mine_type_detail &&
              type.mine_type_detail.map(({ mine_commodity_code }) => {
                return (
                  <span>
                    {mine_commodity_code
                      ? this.props.mineCommodityOptionsHash[mine_commodity_code]
                      : " "}
                  </span>
                );
              })}
          </Col>
        </Row>
      </div>
    ));

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  openModal(event, mineStatusOptions, mineRegionOptions, mineTenureTypes, onSubmit, title, mine) {
    event.preventDefault();
    const initialValues = {
      name: mine.mine_detail[0] ? mine.mine_detail[0].mine_name : null,
      latitude: mine.mine_location[0] ? mine.mine_location[0].latitude : null,
      longitude: mine.mine_location[0] ? mine.mine_location[0].longitude : null,
      mine_status: mine.mine_status[0] ? mine.mine_status[0].status_values : null,
      major_mine_ind: mine.mine_detail[0] ? mine.mine_detail[0].major_mine_ind : false,
      mine_region: mine.mine_detail[0] ? mine.mine_detail[0].region_code : null,
    };

    this.props.openModal({
      props: {
        mineStatusOptions,
        mineRegionOptions,
        mineTenureTypes,
        onSubmit,
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
                this.props.mineStatusOptions,
                this.props.mineRegionOptions,
                this.props.mineTenureTypes,
                this.handleUpdateMineRecord,
                ModalContent.UPDATE_MINE_RECORD,
                this.props.mine
              )
            }
          >
            <img alt="pencil" style={{ padding: "5px" }} src={GREEN_PENCIL} />
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
            <img alt="document" style={{ padding: "5px" }} src={GREEN_DOCUMENT} />
            {ModalContent.ADD_TAILINGS}
          </button>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className="dashboard__header--card">
        <div className="dashboard__header--card__content">
          <div className="inline-flex between">
            <h1>{this.props.mine.mine_detail[0].mine_name} </h1>
            <ConditionalButton
              isDropdown
              overlay={menu}
              string={<Icon type="ellipsis" theme="outlined" style={{ fontSize: "30px" }} />}
            />
          </div>
          <Divider />
          <h5>Mine No.: {this.props.mine.mine_detail[0].mine_no} </h5>
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
                <h3>
                  {this.props.mine.mine_status[0].status_labels.map((label, i) => (
                    <span className="mine__status" key={i}>
                      {label}
                    </span>
                  ))}
                </h3>
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
                <Button>
                  {this.props.mine.mine_type.map((tenure) => (
                    <span className="mine_tenure" key={tenure.mine_tenure_type_guid}>
                      {this.props.mineTenureHash[tenure.mine_tenure_type_code]}
                    </span>
                  ))}
                </Button>
              </Popover>
            ) : (
              String.EMPTY_FIELD
            )}
          </h5>
          <h5>
            {this.props.mine.mine_detail[0].major_mine_ind
              ? String.MAJOR_MINE
              : String.REGIONAL_MINE}
          </h5>
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
              {this.props.mine.mine_detail[0].region_code
                ? this.props.mineRegionHash[this.props.mine.mine_detail[0].region_code]
                : String.EMPTY_FIELD}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default MineHeader;
