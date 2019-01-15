import React from "react";

import { BC_GOV } from "@/constants/assets";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";

export const Header = () => (
  <div className="header">
    <img alt="bc_gov_logo" src={BC_GOV} />
    <h1 className="sitetitle">BC MineSpace</h1>
  </div>
);

export default AuthenticationGuard(Header);
