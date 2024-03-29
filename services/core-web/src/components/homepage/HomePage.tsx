import React from "react";

import HomeBanner from "./HomeBanner";
import HomeTopLinks from "./HomeTopLinks";
import HomeInfographs from "./HomeInfographs";
import HomeMineActivity from "./HomeMineActivity";
import HomeSidePanel from "./HomeSidePanel";

import { Row, Col } from "antd";

const HomePage = () => {
  return (
    <>
      <HomeBanner />
      <Row className="home-content">
        <Col xs={24} lg={16} className="home-main-content">
          <div className="home-main-content-container">
            <HomeTopLinks />
            <HomeInfographs />
            <HomeMineActivity />
          </div>
        </Col>
        <Col lg={7} xs={24}>
          <HomeSidePanel />
        </Col>
      </Row>
    </>
  );
};

export default HomePage;
