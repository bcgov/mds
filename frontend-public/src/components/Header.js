import React from "react";
import Authentication from "@/components/authentication/Authentication";

import { BC_GOV } from "@/constants/assets";

export const Header = () => (
  <div className="header-wrapper">
    <div className="header">
      <img alt="bc_gov_logo" src={BC_GOV} />
      <h1 className="header-h1">
        <span className="header-title-bc">BC</span>
        <span className="header-title"> MineSpace</span>
      </h1>
      <Authentication />
    </div>
  </div>
);

export default Header;
