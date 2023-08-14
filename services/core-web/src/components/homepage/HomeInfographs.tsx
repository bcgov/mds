import React from "react";

import { Row, Col, Card, Typography, Divider } from "antd";

const HomeInfographs = () => {
  // TODO:
  // 1. that email is or should be a constant somewhere
  // 2. submit a request online should be a link to somewhere
  // 3. data- put it in there, and align it nicely
  return (
    <div style={{ border: "1px solid deeppink" }}>
      <Typography.Title level={1}>Key Insights</Typography.Title>
      <Typography.Paragraph>
        Need a specific data query from CORE or more information about our data? Contact our data
        team at EMLIAnalytics@bc.gov.ca or submit a request online.
      </Typography.Paragraph>
      <Card>data</Card>
      <Card>more data</Card>
      <Card>not data</Card>
    </div>
  );
};

export default HomeInfographs;
