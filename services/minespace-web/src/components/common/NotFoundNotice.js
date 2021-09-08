import React from "react";
import { StopOutlined } from "@ant-design/icons";
import { Result, Row, Col, Typography } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text } = Typography;

const NotFoundNotice = () => (
  <Row>
    <Col span={24}>
      <Result
        title="Mine Not Found"
        status="error"
        subTitle={<Text>It appears the mine you are requesting does not exist.</Text>}
        icon={<StopOutlined />}
        extra={
          <Paragraph>
            Please contact&nbsp;
            <a href={Strings.MDS_EMAIL}>{Strings.MDS_EMAIL}</a>
            &nbsp;for assistance.
          </Paragraph>
        }
      />
    </Col>
  </Row>
);

export default NotFoundNotice;
