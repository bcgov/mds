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
  { title: "Incident No.", dataIndex: "incident_no", key: "incident_no", sorter: true },
  { title: "Occurred On", dataIndex: "occured_on", key: "occured_on", sorter: true },
  { title: "Reported By", dataIndex: "reported_by", key: "reported_by", sorter: true },
  { title: "Documents", dataIndex: "documents", key: "documents", sorter: true },
];

const data = [];

export class Incidents extends Component {
  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Incidents</Title>
          <Paragraph>
            The below table displays all of the{" "}
            <Text className="color-primary" strong>
              reported incidents
            </Text>{" "}
            associated with this mine.
          </Paragraph>
          <Table
            size="small"
            columns={columns}
            expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
            dataSource={data}
            locale={{ emptyText: "This mine has no incident data." }}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

Incidents.propTypes = propTypes;
Incidents.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Incidents);
