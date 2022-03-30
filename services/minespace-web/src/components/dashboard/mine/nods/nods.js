import React, { Component } from "react";
import { Col, Row, Typography } from "antd";

// eslint-disable-next-line react/prefer-stateless-function
export class Nods extends Component {
  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>Nods</Typography.Title>
          <Typography.Paragraph>
            The below table displays all of the&nbsp;
            <Typography.Text className="color-primary" strong>
              notices of departure
            </Typography.Text>
            &nbsp;associated with this mine.
          </Typography.Paragraph>
        </Col>
      </Row>
    );
  }
}

export default Nods;
