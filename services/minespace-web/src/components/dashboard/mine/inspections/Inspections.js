/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Table, Typography } from "antd";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

const columns = [
  { title: "Order No.", dataIndex: "order_no", key: "order_no", sorter: true },
  { title: "Violation", dataIndex: "violation", key: "violation", sorter: true },
  { title: "Report No.", dataIndex: "report_no", key: "report_no", sorter: true },
  { title: "Inspection Type", dataIndex: "inspection_type", key: "inspection_type", sorter: true },
  { title: "Inspector", dataIndex: "inspector", key: "inspector", sorter: true },
  { title: "Order Status", dataIndex: "order_status", key: "order_status", sorter: true },
  { title: "Due", dataIndex: "due", key: "due", sorter: true },
];

const data = [];

export class Inspections extends Component {
  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Inspections</Title>
          <Paragraph>
            The below table displays all of the{" "}
            <Text className="color-primary" strong>
              inspection orders
            </Text>{" "}
            associated with this mine.
          </Paragraph>
          <Table
            size="small"
            columns={columns}
            expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
            dataSource={data}
            locale={{ emptyText: "This mine has no inspection data." }}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

Inspections.propTypes = propTypes;
Inspections.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Inspections);
