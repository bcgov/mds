import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

import { BC_GOV } from "@/constants/assets";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";
import * as Route from "@/constants/routes";

export const Header = () => (
  <div className="header-wrapper">
    <div className="header">
      <img alt="bc_gov_logo" src={BC_GOV} />
      <h1 className="header-h1">
        <span className="header-title-bc">BC</span>
        <span className="header-title"> MineSpace</span>
      </h1>
      <Link to={Route.DASHBOARD.route}>
        <Button type="secondary" className="login-btn">
          Log in
        </Button>
      </Link>
    </div>
  </div>
);

export default AuthenticationGuard(Header);
