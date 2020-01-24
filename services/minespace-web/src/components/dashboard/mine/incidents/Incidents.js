/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Table, Typography } from "antd";
// import * as Strings from "@/constants/strings";
// import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const { Paragraph, Title } = Typography;

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
          <Title level={4}>Incident Details</Title>
          <Paragraph>
            Morbi consequat, augue et pulvinar condimentum, nunc urna congue diam, at tempus justo
            eros non leo.
          </Paragraph>
          <Table
            size="small"
            columns={columns}
            expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
            dataSource={data}
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
