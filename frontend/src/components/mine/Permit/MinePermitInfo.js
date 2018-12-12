import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as String from "@/constants/strings";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MinePermitInfo extends Component {
  render() {
    const { mine } = this.props;
    return (
      <div>
        <Row type="flex" style={{ textAlign: "center" }}>
          <Col span={4}>
            <h2>Permit #</h2>
          </Col>
          <Col span={4}>
            <h2>Permittee</h2>
          </Col>
          <Col span={4}>
            <h2>Status</h2>
          </Col>
          <Col span={4}>
            <h2>First Issued</h2>
          </Col>
          <Col span={4}>
            <h2>Last Amended</h2>
          </Col>
          <Col span={4}>
            <h2>Authorization End Date</h2>
          </Col>
        </Row>
        <Divider style={{ height: "2px", backgroundColor: "#013366", margin: "0" }} />
        {mine.mine_permit.map((permit) => (
          <div key={permit.permit_no}>
            <Row type="flex" style={{ textAlign: "center" }}>
              <Col id="permit_no" span={4}>
                <p>{permit.permit_no}</p>
              </Col>
              <Col id="permittee" span={4}>
                {permit.permittee[0].party.party_name}
              </Col>
              <Col span={4}>{String.EMPTY_FIELD}</Col>
              <Col id="permit_issue_date" span={4}>
                {permit.issue_date}
              </Col>
              <Col span={4}>{String.EMPTY_FIELD}</Col>
              <Col span={4}>{String.EMPTY_FIELD}</Col>
              <Divider />
            </Row>
          </div>
        ))}
        {mine.mine_permit.length === 0 && <NullScreen type="permit" />}
      </div>
    );
  }
}

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;
export default MinePermitInfo;
