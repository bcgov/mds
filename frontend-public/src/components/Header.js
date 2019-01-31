import React from "react";
import { Link } from "react-router-dom";

import Authentication from "@/components/authentication/Authentication";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";

export const Header = () => (
  <div className="header inline-flex between">
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
    <Authentication />
  </div>
);

export default Header;
