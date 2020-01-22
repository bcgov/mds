import React from "react";
import { Link } from "react-router-dom";
import Authentication from "@/components/authentication/Authentication";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";

export const HeaderContent = () => (
  <div className="header-content">
    <span className="header-logo">
      <Link to={routes.HOME.route}>
        <img alt="BC Government Logo" src={BC_GOV} height={50} />
      </Link>
    </span>
    <span className="header-title">MineSpace</span>
    <span className="header-menu">
      <Authentication />
    </span>
  </div>
);

export default HeaderContent;
