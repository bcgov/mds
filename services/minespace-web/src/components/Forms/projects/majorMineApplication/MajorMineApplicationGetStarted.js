import React from "react";
import { Col, Row, Typography } from "antd";

export const MajorMineApplicationGetStarted = () => {
  return (
    <Row>
      <Col style={{ marginLeft: "15%" }}>
        <Typography.Title level={3}>
          Getting Started with your Major Mine Submission
        </Typography.Title>
        <Typography.Paragraph>
          Basic information about what a major mine submission is will go here
        </Typography.Paragraph>
        <Typography.Title level={4}>Basic Information</Typography.Title>
        <Typography.Paragraph>Information what is needed for this section</Typography.Paragraph>
        <Typography.Title level={4}>Upload Primary Document</Typography.Title>
        <Typography.Paragraph>Information what is needed for this section</Typography.Paragraph>
        <Typography.Title level={4}>Upload Supporting Documents</Typography.Title>
        <Typography.Paragraph>Information what is needed for this section</Typography.Paragraph>
      </Col>
    </Row>
  );
};

export default MajorMineApplicationGetStarted;
