/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row, Divider } from 'antd';
import NullScreen from '@/components/common/NullScreen';
import { NO_MINE } from '@/constants/assets';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineSummary extends Component {
  render() {
    const { mine } = this.props;
    if (!mine.mgr_appointment[0]) {
      return (<NullScreen type="generic" />);
    }
    return (
      <div>
        <Card className="card-top">
          <Row type="flex">
            <Col md={12} xs={24}><h4>Mine Manager</h4></Col>
            <Col md={12} xs={24}><h4>Manager Since</h4></Col>
          </Row>
          <Row type="flex">
            <Col md={12} xs={24}><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></Col>
            <Col md={12} xs={24}><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></Col>
          </Row>
          <Divider />
          <Row type="flex">
            <Col md={12} xs={24}><h4>Permittee</h4></Col>
            <Col md={12} xs={24}><h4>Permittee Since</h4></Col>
          </Row>
          <Row type="flex">
            <Col md={12} xs={24}><p className="p-large">N/A</p></Col>
            <Col md={12} xs={24}><p className="p-large">N/A</p></Col>
          </Row>
        </Card>
      </div>
    );
  }
}

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default MineSummary;
