// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Typography } from "antd";
import PermitsTable from "@/components/dashboard/mine/Permits/PermitsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

export class Permits extends Component {
  // TODO: Accurately set isLoaded when file is more properly implemented.
  state = { isLoaded: true };

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Permits</Title>
          <Paragraph>
            The below table displays all of the&nbsp;
            <Text className="color-primary" strong>
              permit applications
            </Text>
            &nbsp;associated with this mine.
          </Paragraph>
          <PermitsTable isLoaded={this.state.isLoaded} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

Permits.propTypes = propTypes;
Permits.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Permits);
