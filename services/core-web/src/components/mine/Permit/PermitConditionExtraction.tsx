import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { PERMIT } from "@/constants/assets";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";

const { Title } = Typography;

export const RenderExtractionStart: FC = () => (
  <Row align="middle" justify="space-between" gutter={[10, 16]}>
    <Col span={24}>
      <Title className="margin-none" level={2}>
        Permit Conditions
      </Title>
    </Col>
    <Col span={24}>
      <Row gutter={10} style={{ background: "#fff" }} justify={"center"}>
        <div className="null-screen fade-in" style={{ maxWidth: "1024px" }}>
          <div>
            <img alt="mine_img" src={PERMIT} />
            <h3>Start extracting permit conditions</h3>
            <p>
              Start extracting the latest permit conditions. This process supports the ministry in
              permit drafting and compliance by building a comprehensive condition repository,
              adding report requirements, and making it easier to track, update, and share permit
              conditions accross your team.
            </p>
          </div>
        </div>
      </Row>
    </Col>
  </Row>
);

export const RenderExtractionProgress: FC = () => (
  <Row align="middle" justify="space-between" gutter={[10, 16]}>
    <Col span={24}>
      <Title className="margin-none" level={2}>
        Permit Conditions
      </Title>
    </Col>
    <Col span={24}>
      <Row gutter={10} style={{ background: "#fff" }} justify={"center"}>
        <div className="null-screen fade-in" style={{ maxWidth: "1024px" }}>
          <div>
            <LoadingOutlined style={{ fontSize: 120 }} />
            <h3>Extracting permit conditions</h3>
            <p>
              We are extracing the permit conditions. This process may take anywhere from a few
              minutes to an hour. Feel free to leave and return later to continue your work.
            </p>
          </div>
        </div>
      </Row>
    </Col>
  </Row>
);
