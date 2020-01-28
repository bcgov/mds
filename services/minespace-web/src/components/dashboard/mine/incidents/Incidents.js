// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography } from "antd";
import CustomPropTypes from "@/customPropTypes";
import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

export class Incidents extends Component {
  // TODO: Accurately set isLoaded when file is more properly implemented.
  state = { isLoaded: true };

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Incidents</Title>
          <Paragraph>
            The below table displays all of the&nbsp;
            <Text className="color-primary" strong>
              reported incidents
            </Text>
            &nbsp;associated with this mine.
          </Paragraph>
          <IncidentsTable isLoaded={this.state.isLoaded} />
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
