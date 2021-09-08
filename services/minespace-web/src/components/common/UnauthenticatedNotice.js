import React from "react";
import { StopOutlined } from "@ant-design/icons";
import { Result, Row, Col, Typography } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text } = Typography;

const UnauthenticatedNotice = () => (
  <Row>
    <Col span={24}>
      <Result
        title="Access Denied"
        status="error"
        subTitle={<Text>You are not authorized to access this page.</Text>}
        icon={<StopOutlined />}
        extra={
          <Paragraph>
            You may have to log in. Otherwise, please contact&nbsp;
            <a href={Strings.MDS_EMAIL}>{Strings.MDS_EMAIL}</a>
            &nbsp;for assistance.
          </Paragraph>
        }
      />
    </Col>
  </Row>
);

export default UnauthenticatedNotice;
