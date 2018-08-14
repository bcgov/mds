/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Col, Row } from 'antd';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineSummary extends Component {
  render() {
    const { mine } = this.props;
    return (
      <div>
        <h1> Mine Summary </h1>
        <Card title="Mine">
          <Row type="flex">
            <Col span={6}><strong>MINE_NO</strong></Col>
            <Col span={6}><strong>NAME</strong></Col>
            <Col span={6}><strong>GUID</strong></Col>
            <Col span={6}><strong>TENURE</strong></Col>
          </Row>
          <Row type="flex">
            <Col span={6}>{mine.mine_detail[0] ? mine.mine_detail[0].mine_no : "-"}</Col>
            <Col span={6}>{mine.mine_detail[0] ? mine.mine_detail[0].mine_name : "-"}</Col>
            <Col span={6}>{mine.guid}</Col>
            <Col span={6}>
              {mine.mine_detail[0].mineral_tenure_xref.map((tenure) => {
                return (
                  <div key={tenure.tenure_number_id}>
                    {tenure.tenure_number_id}
                  </div>
                )
              })}
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default MineSummary;
