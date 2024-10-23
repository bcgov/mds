import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { PERMIT } from "@/constants/assets";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleX } from "@fortawesome/pro-light-svg-icons";

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
            <Typography.Title level={3}>Start extracting permit conditions</Typography.Title>
            <Typography.Text>
              Start extracting the latest permit conditions. This process supports the ministry in
              permit drafting and compliance by building a comprehensive condition repository,
              adding report requirements, and making it easier to track, update, and share permit
              conditions accross your team.
            </Typography.Text>
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
            <Typography.Title level={3}>Extracting permit conditions</Typography.Title>
            <Typography.Text>
              We are extracing the permit conditions. This process may take anywhere from a few
              minutes to an hour. Feel free to leave and return later to continue your work.
            </Typography.Text>
          </div>
        </div>
      </Row>
    </Col>
  </Row>
);

export const RenderExtractionError: FC = () => (
  <Row align="middle" justify="space-between" gutter={[10, 16]}>
    <Col span={24}>
      <Title className="margin-none" level={2}>
        Permit Conditions
      </Title>
    </Col>
    <Col span={24}>
      <Row gutter={10} style={{ background: "#fff" }} justify={"center"}>
        <div className="null-screen fade-in" style={{ maxWidth: "728px" }}>
          <div>
            <Typography.Text className="margin-medium--bottom">
              <FontAwesomeIcon icon={faCircleX} size="5x" color="red" />
            </Typography.Text>
            <Typography.Title level={3}>Failed to extract permit conditions</Typography.Title>
            <Typography.Text>
              We encountered an issue while extracting the permit conditions. Please try again. if
              the problem persists, check the file and ensure it meets the required format.
            </Typography.Text>
          </div>
        </div>
      </Row>
    </Col>
  </Row>
);


export const RenderExtractionError: FC = () => (
  <Row align="middle" justify="space-between" gutter={[10, 16]}>
    <Col span={24}>
      <Title className="margin-none" level={2}>
        Permit Conditions
      </Title>
    </Col>
    <Col span={24}>
      <Row gutter={10} style={{ background: "#fff" }} justify={"center"}>
        <div className="null-screen fade-in" style={{ maxWidth: "728px" }}>
          <div>
            <p className="margin-medium--bottom">
              <FontAwesomeIcon icon={faCircleX} size="5x" color="red" />
            </p>
            <h3>Failed to extract permit conditions</h3>
            <p>
              We encountered an issue while extracting the permit conditions. Please try again. if the problem persists, check the file and ensure it meets the required format.
            </p>
          </div>
        </div>
      </Row>
    </Col>
  </Row>
);