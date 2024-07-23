import React from "react";
import { Button, Col, Row, Typography } from "antd";

const { Title } = Typography;

const ViewPermitConditions = () => {
  return (
    <div className="view-permits-content">
      <Row justify="space-between" align="middle">
        <Col>
          <Title className="margin-none padding-lg--top padding-lg--bottom" level={2}>
            Permit Conditions
          </Title>
        </Col>
        <Col>
          <Button type="primary">Edit Permit</Button>
        </Col>
      </Row>
    </div>
  );
};

export default ViewPermitConditions;
