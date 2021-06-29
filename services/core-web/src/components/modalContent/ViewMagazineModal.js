/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Descriptions, Row, Col, Divider } from "antd";
import * as Strings from "@common/constants/strings";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
};

const explosiveCode = "EXP";
export const ViewMagazineModal = (props) => {
  const title = props.type === explosiveCode ? "Explosive" : "Detonator";
  const magazines =
    props.type === explosiveCode
      ? props.explosivesPermit?.explosive_magazines
      : props.explosivesPermit?.detonator_magazines;
  const total =
    props.type === explosiveCode
      ? `${props.explosivesPermit?.total_explosive_quantity || "0"} Kgs`
      : `${props.explosivesPermit?.total_detonator_quantity || "0"} Units`;
  return (
    <div>
      <h4>{`${title} Magazine Detail`}</h4>
      <br />
      {magazines.map((magazine, i) => (
        <>
          <Row gutter={16}>
            <Col span={2}>
              <h4>{i + 1}.</h4>
            </Col>
            <Col span={22}>
              <Descriptions column={3}>
                <Descriptions.Item label="Type No.">{magazine.type_no}</Descriptions.Item>
                <Descriptions.Item label="Tag No.">{magazine.tag_no}</Descriptions.Item>
                <Descriptions.Item label="Construction">{magazine.construction}</Descriptions.Item>
                <Descriptions.Item label="Quantity">{magazine.quantity}</Descriptions.Item>
                <Descriptions.Item label="Latitude">{magazine.latitude}</Descriptions.Item>
                <Descriptions.Item label="Longitude">{magazine.longitude}</Descriptions.Item>
              </Descriptions>
              <Descriptions column={3}>
                <Descriptions.Item label="Length(m)">{magazine.length}</Descriptions.Item>
                <Descriptions.Item label="Width(m)">{magazine.width}</Descriptions.Item>
                <Descriptions.Item label="Height(m)">{magazine.height}</Descriptions.Item>
              </Descriptions>
              <Descriptions column={1}>
                <Descriptions.Item label="Distance from Road or Work Area">
                  {magazine.distance_road}
                </Descriptions.Item>
                <Descriptions.Item label="Distance from Dwelling or Flammable Material Storage Area">
                  {magazine.distance_dwelling}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
            </Col>
          </Row>
        </>
      ))}

      {magazines.length === 0 && <p>No Data</p>}

      <br />
      <h4>Storage Detail</h4>
      <br />
      <Descriptions column={1}>
        <Descriptions.Item label="Total Maximum Quantity">{total}</Descriptions.Item>
      </Descriptions>
      <Descriptions column={2}>
        <Descriptions.Item label="Latitude">{props.explosivesPermit.latitude}</Descriptions.Item>
        <Descriptions.Item label="Longitude">{props.explosivesPermit.longitude}</Descriptions.Item>
      </Descriptions>
      <ExplosivesPermitMap mine={props.explosivesPermit} />

      <Descriptions column={3}>
        <Descriptions.Item label="Mine No.">{props.mine.mine_no} </Descriptions.Item>
        <Descriptions.Item label="Mine Name"> {props.mine.mine_name}</Descriptions.Item>
        <Descriptions.Item label="Mine Operator" />
      </Descriptions>
      <div className="right center-mobile">
        <Button className="full-mobile" type="primary" onClick={props.closeModal}>
          OK
        </Button>
      </div>
    </div>
  );
};

ViewMagazineModal.propTypes = propTypes;

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(ViewMagazineModal);
