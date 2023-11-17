import React from "react";
import StopOutlined from "@ant-design/icons/StopOutlined";
import { Result, Row, Col, Typography } from "antd";
import * as Strings from "@/constants/strings";

const UnauthenticatedNotice = () => (
  <Row>
    <Col span={24}>
      <Result
        title="Access Denied"
        status="error"
        subTitle={<Typography.Text>You are not authorized to access this page.</Typography.Text>}
        icon={<StopOutlined />}
        extra={
          <Typography.Paragraph>
            You may have to log in. Otherwise, please contact&nbsp;
            <a href={Strings.MDS_EMAIL}>{Strings.MDS_EMAIL}</a>
            &nbsp;for assistance.
          </Typography.Paragraph>
        }
      />
    </Col>
  </Row>
);

export default UnauthenticatedNotice;
