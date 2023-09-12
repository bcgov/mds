import React from "react";
import { Typography, Col, Row } from "antd";

import SearchBarNew from "@/components/search/SearchBarNew";
import { BACKGROUND } from "@/constants/assets";

const HomeBanner = () => {
  return (
    <div
      style={{ backgroundImage: `url(${BACKGROUND})`, padding: "64px 32px" }}
      id="homepage-banner"
    >
      <Col>
        <Typography.Title
          level={2}
          style={{ color: "white", fontSize: "28px", textAlign: "center" }}
        >
          Welcome back to CORE
        </Typography.Title>
        <Row id="home-banner-search-container">
          <Col span={18}>
            <SearchBarNew
              placeholderText="Search by Mines, Contacts, Permits or Documents Name..."
              size="large"
            />
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default HomeBanner;
