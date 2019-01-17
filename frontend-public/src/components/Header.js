import React from "react";
import { Button, Row, Col } from "antd";
import { Link } from "react-router-dom";

import { BC_GOV } from "@/constants/assets";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";
import * as Route from "@/constants/routes";

export const Header = () => (
  <div className="header">
    <Row>
      <Col xs={24} sm={16} md={16} lg={16}>
        <img alt="bc_gov_logo" src={BC_GOV} />
        <div className="inline align-bot">
          <h1>
            <span className="header-title-bc">BC</span>
            <span className="header-title"> MineSpace</span>
          </h1>
        </div>
      </Col>
      <Col xs={24} sm={8} md={8} lg={8}>
        <Link to={Route.DASHBOARD.route}>
          <Button type="secondary" className="login-btn">
            Log in
          </Button>
        </Link>
      </Col>
    </Row>
  </div>
);

export default AuthenticationGuard(Header);
