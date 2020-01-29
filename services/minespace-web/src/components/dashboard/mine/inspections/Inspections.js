// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Typography } from "antd";
import InspectionsTable from "@/components/dashboard/mine/inspections/InspectionsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

export class Inspections extends Component {
  // TODO: Accurately set isLoaded when file is more properly implemented.
  state = { isLoaded: true };

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Inspections</Title>
          <Paragraph>
            This table shows your mine's&nbsp;
            <Text className="color-primary" strong>
              inspection history
            </Text>
            &nbsp;since March 2018. Each row represents an individual order.
          </Paragraph>
          <InspectionsTable isLoaded={this.state.isLoaded} />
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
