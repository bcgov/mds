import React from "react";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";

import Authentication from "@/components/authentication/Authentication";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";

export const Header = () => (
  <div className="header inline-flex between tablet-block tablet-center">
    {/* <Row> */}
    {/* <Col xs={24} sm={18} md={18} lg={18}> */}
    <div>
      <Link to={routes.HOME.route}>
        <img alt="bc_gov_logo" src={BC_GOV} />
      </Link>
      <div className="inline align-bot">
        <h1>
          <span className="header-title-bc">BC</span>
          <span className="header-title"> MineSpace</span>
        </h1>
      </div>
    </div>
    {/* </Col> */}
    {/* <Col xs={24} sm={6} md={6} lg={6}> */}
    <Authentication />
    {/* </Col> */}
    {/* </Row> */}
  </div>
);

export default Header;
