import React from "react";
import { Typography, Col, Row } from "antd";

import SearchBar from "@/components/search/SearchBar";
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
      <Col>
        <Typography.Title
          level={1}
          style={{ color: "white", fontSize: "28px", textAlign: "center" }}
        >
          Welcome back to CORE
        </Typography.Title>
        <Row id="home-banner-search-container">
          <Col span={18}>
            <SearchBar
              placeholderText="Search by Mines, Contacts, Permits or Documents Name..."
              size="large"
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
    </div>
  );
};

export default HomeBanner;
