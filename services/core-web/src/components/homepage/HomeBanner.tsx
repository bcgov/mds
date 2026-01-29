import React from "react";
import { Typography, Col, Row } from "antd";

import GlobalSearch from "@/components/search/GlobalSearch/GlobalSearch";
import { BACKGROUND } from "@/constants/assets";

const HomeBanner = () => {
  return (
    <div
      style={
        {
          "--img": `url(${BACKGROUND})`,
          position: "relative",
        } as React.CSSProperties
      }
      id="homepage-banner"
    >
      <Row justify="center">
        <Col>
          <Typography.Title
            level={1}
            style={{ color: "white", fontSize: "28px", textAlign: "center" }}
          >
            Welcome back to CORE
          </Typography.Title>
          <Row align="middle" justify="center">
            <Col span={24}>
              <GlobalSearch
                placeholder="Search by Mines, Contacts, Permits or Documents Name..."
                size="large"
                enableShortcut={false}
              />
            </Col>
          </Row>
        </Col>

        <Typography.Paragraph
          type="secondary"
          style={{
            position: "absolute",
            right: "10px",
            bottom: "10px",
            margin: "0",
            fontSize: "14px",
            color: "#fff",
            opacity: 0.8,
          }}
        >
          Photo Credit: Dominic Yague
        </Typography.Paragraph>
      </Row>
    </div>
  );
};

export default HomeBanner;
