import React from "react";
import StopOutlined from "@ant-design/icons/StopOutlined";
import { Result, Row, Col, Typography } from "antd";
import * as Strings from "@/constants/strings";

const NotFoundNotice = () => (
  <Row>
    <Col span={24}>
      <Result
        title="Mine Not Found"
        status="error"
        subTitle={
          <Typography.Text>It appears the mine you are requesting does not exist.</Typography.Text>
        }
        icon={<StopOutlined />}
        extra={
          <Typography.Paragraph>
            Please contact&nbsp;
            <a href={Strings.MDS_EMAIL}>{Strings.MDS_EMAIL}</a>
            &nbsp;for assistance.
          </Typography.Paragraph>
        }
      />
    </Col>
  </Row>
);

export default NotFoundNotice;
